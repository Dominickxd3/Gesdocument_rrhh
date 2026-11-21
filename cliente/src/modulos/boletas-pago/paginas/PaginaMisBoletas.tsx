import { useAviso } from '@/compartido/notificaciones/notificaciones';
import { guardarComoPdf, nombreArchivo } from '@/compartido/documentos/guardarComoPdf';
import { BarraFirma, useControlFirma } from '@/compartido/componentes/LienzoFirma';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { TablaListado } from '@/compartido/componentes/TablaListado';
import { Insignia } from '@/compartido/componentes/Insignia';
import '@/compartido/estilos/listados';
import { repositorioBoletas } from '../aplicacion/repositorioBoletas';
import { formatearFecha, formatearMoneda } from '../aplicacion/formato';
import { netoAPagar, nombrePeriodo, type BoletaDePeriodo, type ConfiguracionBoletas } from '../dominio/boleta';
import { BoletaDocumento } from '../componentes/BoletaDocumento';
import '../componentes/boletas.css';
import '../componentes/boletaDocumento.css';
// Estilos compartidos del aviso "por firmar" y del subtítulo de las vistas del trabajador.
import '@/modulos/descansos-medicos/componentes/descansos.css';
import '@/modulos/documentos/componentes/expediente.css';

/** Fila de la tabla: la boleta con su periodo y una clave única. */
type Fila = BoletaDePeriodo & { id: string };

/**
 * Vista del colaborador (RNF01): solo sus boletas ya enviadas por RR. HH.
 * Las abre, las revisa y firma las pendientes.
 */
export function PaginaMisBoletas() {
  const usuario = useUsuarioActual();
  const aviso = useAviso();
  const hoja = useRef<HTMLDivElement>(null);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionBoletas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [anio, setAnio] = useState<number | null>(null);
  const [idAbierta, setIdAbierta] = useState<string | null>(null);
  const [firmando, setFirmando] = useState(false);
  // Firma que el colaborador dibuja sobre su línea en la boleta abierta, y zoom de la hoja.
  const control = useControlFirma();
  const { borrar } = control;
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    borrar();
    setZoom(1);
  }, [idAbierta, borrar]);

  const cargar = useCallback(async () => {
    if (!usuario.dni) {
      setCargando(false);
      return;
    }
    const lista = await repositorioBoletas.listarBoletasDe(usuario.dni);
    setFilas(lista.map((f) => ({ ...f, id: f.boleta.id })));
    setCargando(false);
  }, [usuario.dni]);

  useEffect(() => {
    void repositorioBoletas.obtenerConfiguracion().then(setConfiguracion);
    void cargar();
  }, [cargar]);

  const anios = useMemo(() => [...new Set(filas.map((f) => f.periodo.anio))], [filas]);
  const visibles = useMemo(() => filas.filter((f) => !anio || f.periodo.anio === anio), [filas, anio]);
  const porFirmar = filas.filter((f) => f.boleta.firma === 'pendiente');
  const abierta = filas.find((f) => f.id === idAbierta) ?? null;

  const firmar = async ({ periodo, boleta }: Fila, imagen: string) => {
    setFirmando(true);
    await repositorioBoletas.firmar(periodo, boleta.id, imagen);
    await cargar();
    setFirmando(false);
    aviso.current?.show({ severity: 'success', summary: `Boleta de ${nombrePeriodo(periodo)} firmada`, life: 3000 });
  };

  const pie = abierta && (
    <div className="ventana-boleta__pie">
      <Button
        label="Descargar PDF"
        icon="pi pi-download"
        outlined
        className="boton-secundario"
        onClick={() => void guardarComoPdf(hoja.current, nombreArchivo('Boleta', nombrePeriodo(abierta.periodo), abierta.boleta.trabajador))}
      />
      <Button label="Cerrar" text className="boton-texto" onClick={() => setIdAbierta(null)} />
    </div>
  );

  return (
    <div className="pagina-papeletas">
      <header className="pp-encabezado">
        <div>
          <h1>Mis boletas</h1>
          <p className="dm-subtitulo">Boletas de pago que RR. HH. publicó en tu cuenta.</p>
        </div>
      </header>

      {porFirmar.length > 0 && (
        <button type="button" className="dm-pendiente-trabajador" onClick={() => setIdAbierta(porFirmar[0].id)}>
          <i className="pi pi-pencil" aria-hidden="true" />
          <span>
            Tienes {porFirmar.length} {porFirmar.length === 1 ? 'boleta' : 'boletas'} por firmar.
          </span>
          <i className="pi pi-angle-right" aria-hidden="true" />
        </button>
      )}

      <div className="pp-filtros__fila">
        <Dropdown value={anio} options={anios} onChange={(e) => setAnio(e.value ?? null)} placeholder="Todos los años" showClear className="pp-filtros__area" />
      </div>

      <TablaListado
        datos={visibles}
        clave="id"
        nombrePlural="boletas"
        vacio={cargando ? 'Cargando tus boletas…' : 'Aún no tienes boletas publicadas.'}
        alAbrir={(f) => setIdAbierta(f.id)}
      >
        <Column header="Periodo" body={(f: Fila) => <strong>{nombrePeriodo(f.periodo)}</strong>} />
        <Column header="Neto a pagar" body={(f: Fila) => formatearMoneda(netoAPagar(f.boleta))} />
        <Column header="Publicada" body={(f: Fila) => (f.boleta.fechaEnvio ? formatearFecha(f.boleta.fechaEnvio) : '—')} className="tr-col-gris" />
        <Column
          header="Estado"
          body={(f: Fila) =>
            f.boleta.firma === 'firmada' ? <Insignia tono="verde">Firmada</Insignia> : <Insignia tono="ambar">Por firmar</Insignia>
          }
        />
        <Column body={() => <i className="pi pi-angle-right tr-col-gris" aria-hidden="true" />} className="dm-col-flecha" />
      </TablaListado>

      <Dialog
        visible={!!abierta}
        onHide={() => setIdAbierta(null)}
        header={abierta && <span className="ventana-boleta__titulo">Boleta de pago · {nombrePeriodo(abierta.periodo)}</span>}
        footer={pie}
        modal
        dismissableMask
        draggable={false}
        resizable={false}
        className="ventana-boleta"
        style={{ width: '880px' }}
        breakpoints={{ '960px': '94vw', '640px': '100vw' }}
      >
        {abierta && configuracion && (
          <>
            <div ref={hoja}>
              <BoletaDocumento
                boleta={abierta.boleta}
                empresa={configuracion.empresa}
                firmaEmpleador={configuracion.firmaEmpleador}
                controlFirma={abierta.boleta.firma === 'pendiente' ? control : undefined}
                zoom={zoom}
              />
            </div>
            {abierta.boleta.firma === 'pendiente' && (
              <BarraFirma
                control={control}
                zoom={zoom}
                alCambiarZoom={setZoom}
                enviando={firmando}
                alEnviar={() => {
                  const imagen = control.imagen();
                  if (imagen) void firmar(abierta, imagen);
                }}
              />
            )}
          </>
        )}
      </Dialog>
    </div>
  );
}
