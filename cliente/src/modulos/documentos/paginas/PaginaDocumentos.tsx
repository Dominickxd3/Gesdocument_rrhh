import { FiltroFechas, SIN_RANGO, enRango, type RangoFechas } from '@/compartido/componentes/FiltroFechas';
import { ordenarPorTrabajador } from '@/compartido/formato/orden';
import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { esGestor } from '@/compartido/sesion/tipos';
import { TablaListado, CeldaPersona } from '@/compartido/componentes/TablaListado';
import { Insignia } from '@/compartido/componentes/Insignia';
import { VentanaMotivo } from '@/compartido/componentes/VentanaMotivo';
import { fechaCorta } from '@/compartido/almacen/crearAlmacen';
import '@/compartido/estilos/listados';
import { nombreLegible } from '@/modulos/trabajadores/dominio/trabajador';
import { buscarTrabajador } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { AREAS } from '@/modulos/trabajadores/infraestructura/datosTrabajadores';
import {
  corregirDocumento,
  crearDocumento,
  enviarAFirma,
  firmarDocumento,
  observarDocumento,
  useDocumentos,
} from '../aplicacion/almacenDocumentos';
import { ESTADOS_DOCUMENTO, TIPOS_DOCUMENTO, habilitadoParaTrabajador, infoEstado, type Documento, type EstadoDocumento, type TipoDocumento } from '../dominio/documento';
import { VentanaDocumento, tituloDocumento } from '../componentes/VentanaDocumento';
import { VentanaNuevoDocumento } from '../componentes/VentanaNuevoDocumento';

/** Misma ruta, distinta pantalla según el rol. */
export function PaginaDocumentos() {
  const usuario = useUsuarioActual();
  return esGestor(usuario) ? <DocumentosRrhh /> : <MisDocumentos />;
}

const fechaDe = (d: Documento) => d.historial[d.historial.length - 1].fecha;

/** RR. HH. (CUS40–CUS44, CUS47, CUS50): expedientes, preparación, envío a firma y correcciones. */
function DocumentosRrhh() {
  const usuario = useUsuarioActual();
  const documentos = useDocumentos();
  const [params, setParams] = useSearchParams();
  const dniExpediente = params.get('dni');
  const aviso = useRef<Toast>(null);
  const [busqueda, setBusqueda] = useState('');
  const [area, setArea] = useState<string | null>(null);
  const [fechas, setFechas] = useState<RangoFechas>(SIN_RANGO);
  const [tipo, setTipo] = useState<TipoDocumento | null>(null);
  const [estado, setEstado] = useState<EstadoDocumento | null>(null);
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);

  const expediente = dniExpediente ? buscarTrabajador(dniExpediente) : undefined;
  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtrados = documentos.filter(
      (d) =>
        (!dniExpediente || d.dni === dniExpediente) &&
        (!area || buscarTrabajador(d.dni)?.area === area) &&
        (!tipo || d.tipo === tipo) &&
        enRango(fechaDe(d), fechas) &&
        (!estado || d.estado === estado) &&
        (!q || `${d.numero} ${d.trabajador} ${d.dni}`.toLowerCase().includes(q)),
    );
    return ordenarPorTrabajador(filtrados, (d) => d.trabajador, (d) => d.numero);
  }, [documentos, busqueda, area, tipo, estado, fechas, dniExpediente]);

  const detalle = documentos.find((d) => d.id === idDetalle) ?? null;
  const avisar = (summary: string, detail?: string) => aviso.current?.show({ severity: 'success', summary, detail, life: 3000 });
  const limpiar = () => {
    setBusqueda('');
    setArea(null);
    setTipo(null);
    setEstado(null);
    setFechas(SIN_RANGO);
    setParams({});
  };

  return (
    <div className="pagina-papeletas">
      <Toast ref={aviso} position="bottom-right" />
      <header className="pp-encabezado">
        <div>
          <h1>{expediente ? `Expediente · ${nombreLegible(expediente.nombre)}` : 'Documentos'}</h1>
          {expediente && (
            <p className="tr-sincronizado">
              DNI {expediente.dni} · {expediente.cargo} · {expediente.area}{' '}
              <Button label="Ver todos" text size="small" onClick={() => setParams({})} />
            </p>
          )}
        </div>
        <div className="pp-encabezado__acciones">
          <Button label="Nuevo documento" icon="pi pi-plus" className="pp-boton-principal" onClick={() => setNuevo(true)} />
        </div>
      </header>

      <div className="pp-filtros__fila">
        <IconField iconPosition="left" className="pp-filtros__busqueda">
          <InputIcon className="pi pi-search" />
          <InputText value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por N°, nombre o DNI" aria-label="Buscar" />
        </IconField>
        <Dropdown value={area} options={AREAS} onChange={(e) => setArea(e.value ?? null)} placeholder="Todas las áreas" filter showClear className="pp-filtros__area" />
        <Dropdown value={tipo} options={TIPOS_DOCUMENTO} optionLabel="etiqueta" optionValue="valor" onChange={(e) => setTipo(e.value ?? null)} placeholder="Todos los tipos" showClear className="pp-filtros__area" />
        <Dropdown value={estado} options={ESTADOS_DOCUMENTO} optionLabel="etiqueta" optionValue="valor" onChange={(e) => setEstado(e.value ?? null)} placeholder="Todos los estados" showClear className="dm-filtro-estado" />
        <FiltroFechas valor={fechas} alCambiar={setFechas} />
      </div>

      <TablaListado
        datos={visibles}
        clave="id"
        nombrePlural="documentos"
        vacio="No hay documentos con estos filtros."
        alAbrir={(d) => setIdDetalle(d.id)}
        claseFila={(d) => `dm-fila es-${d.estado === 'observado' ? 'pendiente_revision' : d.estado}`}
        alLimpiarFiltros={limpiar}
      >
        <Column header="N°" body={(d: Documento) => <strong>{d.numero}</strong>} className="pp-col-fecha" />
        <Column header="Trabajador" body={(d: Documento) => <CeldaPersona nombre={d.trabajador} detalle={`DNI ${d.dni}`} />} />
        <Column header="Área" body={(d: Documento) => buscarTrabajador(d.dni)?.area ?? '—'} className="col-area" headerClassName="col-area" />
        <Column header="Documento" body={tituloDocumento} />
        <Column header="Fecha" body={(d: Documento) => fechaCorta(fechaDe(d))} className="tr-col-gris" />
        <Column header="Estado" body={(d: Documento) => <Insignia tono={infoEstado(d.estado).tono}>{infoEstado(d.estado).etiqueta}</Insignia>} className="pp-col-estado" />
      </TablaListado>

      <VentanaDocumento
        documento={detalle}
        modo="rrhh"
        alCerrar={() => setIdDetalle(null)}
        alEnviar={(d) => {
          enviarAFirma(d, usuario.nombre);
          avisar(`Documento N° ${d.numero} enviado`, 'El trabajador lo verá en "Mis documentos".');
        }}
        alCorregir={(d, archivo) => {
          corregirDocumento(d, usuario.nombre, archivo);
          avisar(`Versión ${d.version + 1} enviada`, 'El documento volvió a firma.');
        }}
      />

      <VentanaNuevoDocumento
        visible={nuevo}
        dniInicial={dniExpediente ?? undefined}
        alCerrar={() => setNuevo(false)}
        alCrear={(datos, enviar) => {
          const numero = crearDocumento(datos, usuario.nombre, enviar);
          setNuevo(false);
          avisar(`Documento N° ${numero} ${enviar ? 'enviado para firma' : 'guardado en preparación'}`);
        }}
      />
    </div>
  );
}

/** Trabajador (CUS45, CUS46, CUS48): ve sus documentos, los firma u observa. */
function MisDocumentos() {
  const usuario = useUsuarioActual();
  const documentos = useDocumentos();
  const aviso = useRef<Toast>(null);
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [observando, setObservando] = useState<Documento | null>(null);

  const mios = documentos.filter((d) => d.dni === usuario.dni && habilitadoParaTrabajador(d));
  const porFirmar = mios.filter((d) => d.estado === 'pendiente_firma');
  const detalle = mios.find((d) => d.id === idDetalle) ?? null;

  return (
    <div className="pagina-papeletas">
      <Toast ref={aviso} position="bottom-right" />
      <header className="pp-encabezado">
        <h1>Mis documentos</h1>
      </header>

      {porFirmar.length > 0 && (
        <button type="button" className="dm-pendiente-trabajador" onClick={() => setIdDetalle(porFirmar[0].id)}>
          <i className="pi pi-pencil" aria-hidden="true" />
          <span>
            Tienes {porFirmar.length} {porFirmar.length === 1 ? 'documento' : 'documentos'} por firmar.
          </span>
          <i className="pi pi-angle-right" aria-hidden="true" />
        </button>
      )}

      <TablaListado datos={mios} clave="id" nombrePlural="documentos" vacio="Aún no tienes documentos." alAbrir={(d) => setIdDetalle(d.id)}>
        <Column header="N°" body={(d: Documento) => <strong>{d.numero}</strong>} className="pp-col-fecha" />
        <Column header="Documento" body={tituloDocumento} />
        <Column header="Fecha" body={(d: Documento) => fechaCorta(fechaDe(d))} className="tr-col-gris" />
        <Column header="Estado" body={(d: Documento) => <Insignia tono={infoEstado(d.estado).tono}>{infoEstado(d.estado).etiqueta}</Insignia>} />
      </TablaListado>

      <VentanaDocumento
        documento={observando ? null : detalle}
        modo="trabajador"
        alCerrar={() => setIdDetalle(null)}
        alFirmar={(d, imagen) => {
          firmarDocumento(d, usuario.nombre, imagen);
          aviso.current?.show({ severity: 'success', summary: 'Documento firmado', life: 2500 });
        }}
        alObservar={(d) => setObservando(d)}
      />

      <VentanaMotivo
        visible={!!observando}
        titulo="Observar documento"
        etiqueta="¿Qué está mal? *"
        ayuda="RR. HH. corregirá el documento y te lo enviará de nuevo."
        boton="Enviar observación"
        sugerencias={['Mi nombre está mal escrito', 'El cargo no es el correcto', 'Las fechas no coinciden']}
        alCerrar={() => setObservando(null)}
        alConfirmar={(texto) => {
          if (observando) observarDocumento(observando, texto, usuario.nombre);
          setObservando(null);
          aviso.current?.show({ severity: 'info', summary: 'Observación enviada a RR. HH.', life: 2500 });
        }}
      />
    </div>
  );
}
