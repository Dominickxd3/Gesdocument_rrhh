import { useMemo, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { presentarSustentos, registrarAviso, useListaDescansos } from '../aplicacion/almacenDescansos';
import { TRABAJADORES } from '../infraestructura/datosPrueba';
import { etiquetaTipo, fechaCorta, type DatosAviso, type Descanso } from '../dominio/descanso';
import { InsigniaEstado, Plazo } from '../componentes/Insignias';
import { VentanaRegistro } from '../componentes/VentanaRegistro';
import { VentanaMiDescanso } from '../componentes/VentanaMiDescanso';

/** Vista del trabajador: avisa su ausencia, sube sus sustentos y ve el resultado (CUS19–CUS22). */
export function PaginaMisDescansos() {
  const usuario = useUsuarioActual();
  const todos = useListaDescansos();
  const aviso = useRef<Toast>(null);
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [avisando, setAvisando] = useState(false);

  // La cuenta se vincula con la ficha del trabajador por DNI.
  const ficha = useMemo(() => TRABAJADORES.find((t) => t.dni === usuario.dni), [usuario.dni]);
  const mios = useMemo(() => todos.filter((d) => d.trabajador.dni === usuario.dni), [todos, usuario.dni]);
  const detalle = mios.find((d) => d.id === idDetalle) ?? null;
  const porAtender = mios.filter((d) => d.estado === 'aviso' || d.estado === 'observado');

  const avisar = (summary: string, detail?: string) => aviso.current?.show({ severity: 'success', summary, detail, life: 3200 });

  const enviarAviso = (datos: DatosAviso) => {
    const numero = registrarAviso(datos, usuario.nombre);
    setAvisando(false);
    avisar(
      `Aviso N° ${numero} enviado`,
      datos.sustentos.certificado ? 'RR. HH. revisará tus documentos.' : 'Recuerda subir tu certificado dentro del plazo.',
    );
  };

  const enviarDocumentos = (d: Descanso, nuevos: Parameters<typeof presentarSustentos>[1]) => {
    presentarSustentos(d, nuevos, usuario.nombre);
    avisar('Documentos enviados', 'RR. HH. los revisará.');
  };

  return (
    <div className="pagina-papeletas pagina-descansos">
      <Toast ref={aviso} position="bottom-right" />

      <header className="pp-encabezado">
        <h1>Mis descansos médicos</h1>
        <div className="pp-encabezado__acciones">
          <Button label="Avisar ausencia" icon="pi pi-plus" className="pp-boton-principal" disabled={!ficha} onClick={() => setAvisando(true)} />
        </div>
      </header>

      {porAtender.length > 0 && (
        <button type="button" className="dm-pendiente-trabajador" onClick={() => setIdDetalle(porAtender[0].id)}>
          <i className="pi pi-exclamation-circle" aria-hidden="true" />
          <span>
            {porAtender[0].estado === 'observado'
              ? `RR. HH. observó tu descanso N° ${porAtender[0].numero}. Sube el documento corregido.`
              : `Falta tu certificado del descanso N° ${porAtender[0].numero}.`}
          </span>
          <Plazo descanso={porAtender[0]} />
          <i className="pi pi-angle-right" aria-hidden="true" />
        </button>
      )}

      <div className="pp-tarjeta-tabla">
        <DataTable
          value={mios}
          dataKey="id"
          onRowClick={(e) => setIdDetalle((e.data as Descanso).id)}
          rowClassName={(d: Descanso) => `pp-fila dm-fila es-${d.estado}`}
          emptyMessage={
            <div className="pp-vacio">
              <i className="pi pi-heart" aria-hidden="true" />
              <p>No tienes descansos médicos registrados.</p>
            </div>
          }
          className="pp-tabla"
        >
          <Column header="N°" body={(d: Descanso) => <strong>{d.numero}</strong>} className="pp-col-fecha" headerClassName="pp-col-fecha" />
          <Column
            header="Periodo"
            body={(d: Descanso) => (
              <span className="dm-periodo">
                {fechaCorta(d.inicio)} – {fechaCorta(d.fin)}
              </span>
            )}
          />
          <Column header="Tipo" body={(d: Descanso) => etiquetaTipo(d.tipo)} className="dm-col-tipo" headerClassName="dm-col-tipo" />
          <Column header="Plazo" body={(d: Descanso) => <Plazo descanso={d} />} />
          <Column header="Estado" body={(d: Descanso) => <InsigniaEstado estado={d.estado} />} />
        </DataTable>
      </div>

      <VentanaMiDescanso descanso={detalle} alCerrar={() => setIdDetalle(null)} alEnviar={enviarDocumentos} />

      <VentanaRegistro
        visible={avisando}
        modo="trabajador"
        trabajadorFijo={ficha}
        alCerrar={() => setAvisando(false)}
        alGuardar={enviarAviso}
      />
    </div>
  );
}
