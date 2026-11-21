import { useAviso } from '@/compartido/notificaciones/notificaciones';
import { buscarTrabajador } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { presentarSustentos, useListaDescansos } from '../aplicacion/almacenDescansos';
import { eliminarBorrador, enviarAviso as enviarAvisoRrhh, guardarBorrador, useBorradoresDe, type BorradorDescanso } from '../aplicacion/borradoresDescanso';
import { TRABAJADORES } from '../infraestructura/datosPrueba';
import { etiquetaTipo, fechaCorta, type DatosAviso, type Descanso } from '../dominio/descanso';
import { InsigniaEstado, Plazo } from '../componentes/Insignias';
import { VentanaRegistro } from '../componentes/VentanaRegistro';
import { VentanaMiDescanso } from '../componentes/VentanaMiDescanso';

/** Vista del trabajador: avisa su ausencia, sube sus sustentos y ve el resultado (CUS19–CUS22). */
export function PaginaMisDescansos() {
  const usuario = useUsuarioActual();
  const todos = useListaDescansos();
  const aviso = useAviso();
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  // Formulario abierto: nuevo aviso o edición de un borrador.
  const [editando, setEditando] = useState<BorradorDescanso | 'nuevo' | null>(null);
  const borradores = useBorradoresDe(usuario.dni);

  // La cuenta se vincula con la ficha del trabajador por DNI.
  // Si el módulo no tiene su ficha, se toma de Trabajadores; así cualquier colaborador con cuenta puede avisar.
  const ficha = useMemo(() => TRABAJADORES.find((t) => t.dni === usuario.dni) ?? buscarTrabajador(usuario.dni), [usuario.dni]);
  const mios = useMemo(() => todos.filter((d) => d.trabajador.dni === usuario.dni), [todos, usuario.dni]);
  const detalle = mios.find((d) => d.id === idDetalle) ?? null;
  const porAtender = mios.filter((d) => d.estado === 'aviso' || d.estado === 'observado');

  const avisar = (summary: string, detail?: string) => aviso.current?.show({ severity: 'success', summary, detail, life: 3200 });

  const idBorrador = editando && editando !== 'nuevo' ? editando.id : undefined;

  /** Antes de enviar se confirma: una vez enviado ya no se puede editar ni eliminar. */
  const confirmarEnvio = (mensaje: string, enviar: () => void) =>
    confirmDialog({
      header: 'Confirmar envío',
      message: `${mensaje} Una vez enviado ya no podrás editarlo ni eliminarlo.`,
      icon: 'pi pi-send',
      acceptLabel: 'Sí, enviar',
      rejectLabel: 'Seguir revisando',
      acceptClassName: 'pp-boton-principal',
      rejectClassName: 'p-button-text',
      accept: enviar,
    });

  const enviarAviso = (datos: DatosAviso) =>
    confirmarEnvio('RR. HH. recibirá tu aviso de ausencia.', () => {
      const numero = enviarAvisoRrhh(datos, usuario.nombre, idBorrador);
      setEditando(null);
      avisar(
        `Aviso N° ${numero} enviado`,
        datos.sustentos.certificado ? 'RR. HH. revisará tus documentos.' : 'Recuerda subir tu certificado dentro del plazo.',
      );
    });

  const guardarComoBorrador = (datos: DatosAviso) => {
    guardarBorrador(datos, idBorrador);
    setEditando(null);
    avisar('Borrador guardado', 'Puedes editarlo o eliminarlo hasta que lo envíes.');
  };

  const eliminar = (b: BorradorDescanso) =>
    confirmDialog({
      header: 'Eliminar borrador',
      message: 'Se borrará este aviso que aún no enviaste.',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'pp-boton-rechazar-lleno',
      rejectClassName: 'p-button-text',
      accept: () => {
        eliminarBorrador(b.id);
        setEditando(null);
        avisar('Borrador eliminado');
      },
    });

  const enviarDocumentos = (d: Descanso, nuevos: Parameters<typeof presentarSustentos>[1]) =>
    confirmarEnvio('RR. HH. revisará los documentos que adjuntaste.', () => {
      presentarSustentos(d, nuevos, usuario.nombre);
      avisar('Documentos enviados', 'RR. HH. los revisará.');
    });

  return (
    <div className="pagina-papeletas pagina-descansos">
      <ConfirmDialog />

      <header className="pp-encabezado">
        <h1>Mis descansos médicos</h1>
        <div className="pp-encabezado__acciones">
          <Button label="Avisar ausencia" icon="pi pi-plus" className="pp-boton-principal" disabled={!ficha} onClick={() => setEditando('nuevo')} />
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

      {borradores.length > 0 && (
        <section className="dm-borradores" aria-label="Borradores sin enviar">
          <h2>Borradores sin enviar</h2>
          <p>RR. HH. aún no los ve. Puedes editarlos o eliminarlos hasta que los envíes.</p>
          <ul>
            {borradores.map((b) => (
              <li key={b.id}>
                <i className="pi pi-file-edit" aria-hidden="true" />
                <div>
                  <strong>
                    {etiquetaTipo(b.datos.tipo)} · {fechaCorta(b.datos.inicio)} – {fechaCorta(b.datos.fin)}
                  </strong>
                  <small>Guardado {fechaCorta(b.actualizado.slice(0, 10))}</small>
                </div>
                <Button label="Editar" icon="pi pi-pencil" text size="small" onClick={() => setEditando(b)} />
                <Button label="Eliminar" icon="pi pi-trash" text size="small" severity="danger" onClick={() => eliminar(b)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="pp-tarjeta-tabla">
        <DataTable responsiveLayout="stack" breakpoint="900px"
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
        visible={!!editando}
        modo="trabajador"
        trabajadorFijo={ficha}
        inicial={editando && editando !== 'nuevo' ? editando.datos : undefined}
        alCerrar={() => setEditando(null)}
        alGuardar={enviarAviso}
        alGuardarBorrador={guardarComoBorrador}
        alEliminarBorrador={editando && editando !== 'nuevo' ? () => eliminar(editando) : undefined}
      />
    </div>
  );
}
