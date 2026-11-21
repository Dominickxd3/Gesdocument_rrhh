import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import {
  duracionMinutos,
  etiquetaTipo,
  formatearDuracion,
  formatearHora,
  puedeEditar,
  puedeImprimir,
  puedeResolver,
  type EventoHistorial,
  type Papeleta,
  numeroPapeleta,
} from '../dominio/papeleta';
import { Avatar, InsigniaEstado } from './Insignias';

interface Propiedades {
  papeleta: Papeleta | null;
  alCerrar: () => void;
  alAprobar: (p: Papeleta) => void;
  alRechazar: (p: Papeleta) => void;
  alEditar: (p: Papeleta) => void;
  alAnular: (p: Papeleta) => void;
  alRestaurar: (p: Papeleta) => void;
  alImprimir: (p: Papeleta) => void;
}

const formatoFechaLarga = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatoMomento = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const ACCIONES: Record<EventoHistorial['accion'], { texto: string; icono: string }> = {
  creada: { texto: 'Registró la papeleta', icono: 'pi pi-plus' },
  editada: { texto: 'Editó la papeleta', icono: 'pi pi-pencil' },
  aprobada: { texto: 'Aprobó', icono: 'pi pi-check' },
  rechazada: { texto: 'Rechazó', icono: 'pi pi-times' },
  anulada: { texto: 'Anuló', icono: 'pi pi-ban' },
  restaurada: { texto: 'Restauró', icono: 'pi pi-replay' },
};

/** Detalle de la papeleta en una ventana centrada (regla de diseño: nunca paneles laterales). */
export function PanelDetalle(props: Propiedades) {
  const { papeleta: p, alCerrar } = props;

  return (
    <Dialog
      visible={!!p}
      onHide={alCerrar}
      showHeader={false}
      modal
      dismissableMask
      draggable={false}
      resizable={false}
      className="pp-panel"
      style={{ width: '520px' }}
      breakpoints={{ '640px': '94vw' }}
    >
      {p && (
        <div className="pp-panel__contenido">
          <header className="pp-panel__encabezado">
            <div>
              <span className="pp-panel__kicker">Papeleta de salida</span>
              <h2>N° {numeroPapeleta(p.numero)}</h2>
            </div>
            <InsigniaEstado estado={p.estado} />
            <Button icon="pi pi-times" text rounded aria-label="Cerrar" className="pp-panel__cerrar" onClick={alCerrar} />
          </header>

          <section className="pp-panel__trabajador">
            <Avatar nombre={p.trabajador.nombre} />
            <div>
              <strong>{p.trabajador.nombre}</strong>
              <small>DNI {p.trabajador.dni}</small>
              <small>
                {p.trabajador.cargo} · {p.trabajador.area}
              </small>
            </div>
          </section>

          <section className="pp-panel__tiempo">
            <div>
              <span>Salida</span>
              <strong>{formatearHora(p.salida)}</strong>
            </div>
            <i className="pi pi-arrow-right" aria-hidden="true" />
            <div>
              <span>Retorno</span>
              <strong>{p.retorno ? formatearHora(p.retorno) : 'No retorna'}</strong>
            </div>
            <div className="pp-panel__total">
              <span>Total</span>
              <strong>{p.retorno ? formatearDuracion(duracionMinutos(p.salida, p.retorno)) : 'Resto del día'}</strong>
            </div>
          </section>

          <dl className="pp-panel__datos">
            <div>
              <dt>Fecha</dt>
              <dd className="pp-capital">{formatoFechaLarga.format(new Date(`${p.fecha}T12:00:00`))}</dd>
            </div>
            <div>
              <dt>Considerar como</dt>
              <dd>{etiquetaTipo(p.tipo)}</dd>
            </div>
            <div className="ancho-completo">
              <dt>Motivo</dt>
              <dd className="pp-panel__cita">{p.motivo}</dd>
            </div>
            {p.observaciones && (
              <div className="ancho-completo">
                <dt>Observaciones</dt>
                <dd>{p.observaciones}</dd>
              </div>
            )}
          </dl>

          <section>
            <h3 className="pp-panel__subtitulo">Historial</h3>
            <ol className="pp-linea-tiempo">
              {[...p.historial].reverse().map((h, i) => (
                <li key={i} className={`es-${h.accion}`}>
                  <span className="pp-linea-tiempo__punto">
                    <i className={ACCIONES[h.accion].icono} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>
                      {h.usuario} · {ACCIONES[h.accion].texto.toLowerCase()}
                    </strong>
                    <small>{formatoMomento.format(new Date(h.fecha))}</small>
                    {h.nota && <p>“{h.nota}”</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <footer className="pp-panel__pie">
            {puedeResolver(p) && (
              <div className="pp-panel__decision">
                <Button label="Rechazar" icon="pi pi-times" outlined className="pp-boton-rechazar" onClick={() => props.alRechazar(p)} />
                <Button label="Aprobar" icon="pi pi-check" className="pp-boton-aprobar" onClick={() => props.alAprobar(p)} />
              </div>
            )}
            <div className="pp-panel__secundarias">
              <Button
                label="Ver papeleta"
                icon="pi pi-file"
                text
                disabled={!puedeImprimir(p)}
                tooltip={puedeImprimir(p) ? undefined : 'Solo las papeletas aprobadas tienen formato oficial'}
                tooltipOptions={{ showOnDisabled: true, position: 'top' }}
                onClick={() => props.alImprimir(p)}
              />
              {puedeEditar(p) && <Button label="Editar" icon="pi pi-pencil" text onClick={() => props.alEditar(p)} />}
              {p.estado === 'anulada' ? (
                <Button label="Restaurar" icon="pi pi-replay" text onClick={() => props.alRestaurar(p)} />
              ) : (
                <Button label="Anular" icon="pi pi-ban" text className="pp-boton-peligro" onClick={() => props.alAnular(p)} />
              )}
            </div>
          </footer>
        </div>
      )}
    </Dialog>
  );
}
