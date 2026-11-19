import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import {
  SUSTENTOS,
  diasPeriodo,
  etiquetaTipo,
  fechaCorta,
  type Descanso,
  type EventoHistorial,
  type TipoSustento,
} from '../dominio/descanso';
import { ultimaResolucion } from '../aplicacion/almacenDescansos';
import { Avatar, InsigniaEstado, Plazo } from './Insignias';
import { VentanaDocumento } from './VentanaDocumento';

interface Propiedades {
  descanso: Descanso | null;
  alCerrar: () => void;
  alVerificar: (d: Descanso) => void;
  alObservar: (d: Descanso) => void;
  alRechazar: (d: Descanso) => void;
  alAprobar: (d: Descanso, reconocido: { inicio: string; fin: string }) => void;
}

const formatoMomento = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const ACCIONES: Record<EventoHistorial['accion'], { texto: string; icono: string }> = {
  aviso: { texto: 'registró el aviso de ausencia', icono: 'pi pi-bell' },
  sustento: { texto: 'presentó sustentos', icono: 'pi pi-paperclip' },
  verificado: { texto: 'verificó la veracidad', icono: 'pi pi-shield' },
  observado: { texto: 'observó el sustento', icono: 'pi pi-exclamation-circle' },
  aprobado: { texto: 'aprobó el descanso', icono: 'pi pi-check' },
  rechazado: { texto: 'rechazó el descanso', icono: 'pi pi-times' },
};

const TEXTO_RESOLUCION = { aprobado: 'Aprobado por', rechazado: 'Rechazado por', observado: 'Observado por' } as const;

/** Quién aprobó, rechazó u observó, cuándo y con qué motivo. */
export function Resolucion({ d }: { d: Descanso }) {
  const r = ultimaResolucion(d);
  if (!r || (d.estado !== 'aprobado' && d.estado !== 'rechazado' && d.estado !== 'observado')) return null;
  const accion = r.accion as keyof typeof TEXTO_RESOLUCION;
  return (
    <div className={`dm-resolucion es-${accion}`}>
      <i className={accion === 'aprobado' ? 'pi pi-check-circle' : accion === 'rechazado' ? 'pi pi-times-circle' : 'pi pi-exclamation-circle'} aria-hidden="true" />
      <div>
        <strong>
          {TEXTO_RESOLUCION[accion]} {r.usuario}
        </strong>
        <small>{formatoMomento.format(new Date(r.fecha))}</small>
        {r.nota && <p>“{r.nota}”</p>}
      </div>
    </div>
  );
}

/**
 * Detalle del descanso en una ventana centrada, con las acciones de revisión de RR. HH.
 * Los sustentos los sube el trabajador desde su cuenta; aquí solo se revisan.
 */
export function VentanaDetalle(props: Propiedades) {
  const { descanso: d, alCerrar } = props;
  const [reconocido, setReconocido] = useState({ inicio: '', fin: '' });
  const [verTipo, setVerTipo] = useState<TipoSustento | null>(null);

  useEffect(() => {
    if (d) setReconocido(d.reconocido ?? { inicio: d.inicio, fin: d.fin });
  }, [d?.id, d?.estado]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!d) return <Dialog visible={false} onHide={alCerrar} />;

  const esperaTrabajador = d.estado === 'aviso' || d.estado === 'observado';
  const enRevision = d.estado === 'pendiente_revision';
  const sustentos = d.sustentos;
  const diasSolicitados = diasPeriodo(d.inicio, d.fin);
  const diasReconocidos = diasPeriodo(reconocido.inicio, reconocido.fin);
  const reconocidoValido =
    diasReconocidos > 0 && reconocido.inicio >= d.inicio && reconocido.fin <= d.fin;

  return (
    <Dialog
      visible
      onHide={alCerrar}
      showHeader={false}
      modal
      dismissableMask
      draggable={false}
      resizable={false}
      className="pp-panel dm-ventana"
      style={{ width: '560px' }}
      breakpoints={{ '640px': '94vw' }}
    >
      <div className="pp-panel__contenido">
        <header className="pp-panel__encabezado">
          <div>
            <span className="pp-panel__kicker">Descanso médico</span>
            <h2>N° {d.numero}</h2>
          </div>
          <InsigniaEstado estado={d.estado} />
          <Button icon="pi pi-times" text rounded aria-label="Cerrar" className="pp-panel__cerrar" onClick={alCerrar} />
        </header>

        <Resolucion d={d} />

        <section className="pp-panel__trabajador">
          <Avatar nombre={d.trabajador.nombre} />
          <div>
            <strong>{d.trabajador.nombre}</strong>
            <small>DNI {d.trabajador.dni}</small>
            <small>
              {d.trabajador.cargo} · {d.trabajador.area}
            </small>
          </div>
        </section>

        <section className="pp-panel__tiempo">
          <div>
            <span>Desde</span>
            <strong>{fechaCorta(d.inicio)}</strong>
          </div>
          <i className="pi pi-arrow-right" aria-hidden="true" />
          <div>
            <span>Hasta</span>
            <strong>{fechaCorta(d.fin)}</strong>
          </div>
          <div className="pp-panel__total">
            <span>Días solicitados</span>
            <strong>{diasSolicitados}</strong>
            {d.reconocido && (
              <span className="dm-reconocido">
                Reconocido: {fechaCorta(d.reconocido.inicio)} – {fechaCorta(d.reconocido.fin)} (
                {diasPeriodo(d.reconocido.inicio, d.reconocido.fin)} días)
              </span>
            )}
          </div>
        </section>

        <dl className="pp-panel__datos">
          <div>
            <dt>Tipo</dt>
            <dd>{etiquetaTipo(d.tipo)}</dd>
          </div>
          <div>
            <dt>Plazo del trabajador</dt>
            <dd>
              <Plazo descanso={d} />
            </dd>
          </div>
          <div className="ancho-completo">
            <dt>Centro médico</dt>
            <dd>{d.centroMedico || '—'}</dd>
          </div>
          <div className="ancho-completo">
            <dt>
              Diagnóstico <span className="dm-confidencial"><i className="pi pi-lock" aria-hidden="true" /> Solo RR. HH.</span>
            </dt>
            <dd>{d.diagnostico || '—'}</dd>
          </div>
        </dl>

        <section>
          <h3 className="pp-panel__subtitulo">Sustentos</h3>
          <ul className="dm-sustentos">
            {SUSTENTOS.map((s) => {
              const archivo = sustentos[s.tipo];
              return (
                <li key={s.tipo} className={archivo ? 'es-recibido' : ''}>
                  <i className={archivo ? 'pi pi-check-circle' : 'pi pi-circle'} aria-hidden="true" />
                  <div>
                    <strong>
                      {s.etiqueta}
                      {s.obligatorio && <span className="dm-obligatorio"> · obligatorio</span>}
                    </strong>
                    <small>{archivo ?? 'No presentado'}</small>
                  </div>
                  {archivo && <Button label="Ver" icon="pi pi-eye" text size="small" onClick={() => setVerTipo(s.tipo)} />}
                </li>
              );
            })}
          </ul>
        </section>

        {enRevision && (
          <section className="dm-revision">
            <label className="dm-verificacion">
              <Checkbox checked={d.verificado} disabled={d.verificado} onChange={() => props.alVerificar(d)} />
              <span>
                <strong>Veracidad comprobada en el portal</strong>
                <small>Consulta el certificado en el portal de EsSalud o del centro médico antes de aprobar.</small>
              </span>
            </label>
            <div className="dm-periodo-reconocido">
              <span className="pp-campo__etiqueta">Periodo reconocido</span>
              <div>
                <input
                  type="date"
                  className="p-inputtext"
                  value={reconocido.inicio}
                  min={d.inicio}
                  max={d.fin}
                  onChange={(e) => setReconocido((r) => ({ ...r, inicio: e.target.value }))}
                />
                <i className="pi pi-arrow-right" aria-hidden="true" />
                <input
                  type="date"
                  className="p-inputtext"
                  value={reconocido.fin}
                  min={d.inicio}
                  max={d.fin}
                  onChange={(e) => setReconocido((r) => ({ ...r, fin: e.target.value }))}
                />
                <span className="dm-periodo-reconocido__dias">{diasReconocidos} días</span>
              </div>
              {!reconocidoValido && <small className="pp-campo__error">Debe estar dentro del periodo solicitado.</small>}
            </div>
          </section>
        )}

        <section>
          <h3 className="pp-panel__subtitulo">Historial</h3>
          <ol className="pp-linea-tiempo">
            {[...d.historial].reverse().map((h, i) => (
              <li key={i} className={`es-${h.accion === 'aprobado' ? 'aprobada' : h.accion === 'rechazado' ? 'rechazada' : h.accion}`}>
                <span className="pp-linea-tiempo__punto">
                  <i className={ACCIONES[h.accion].icono} aria-hidden="true" />
                </span>
                <div>
                  <strong>
                    {h.usuario} · {ACCIONES[h.accion].texto}
                  </strong>
                  <small>{formatoMomento.format(new Date(h.fecha))}</small>
                  {h.nota && <p>“{h.nota}”</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {(esperaTrabajador || enRevision) && (
          <footer className="pp-panel__pie">
            {esperaTrabajador && (
              <p className="dm-esperando">
                <i className="pi pi-hourglass" aria-hidden="true" />
                {d.estado === 'aviso'
                  ? 'Esperando que el trabajador suba su certificado desde su cuenta.'
                  : 'Esperando que el trabajador regularice la documentación observada.'}
                <Plazo descanso={d} />
              </p>
            )}
            {enRevision && (
              <div className="dm-decision">
                <Button label="Observar" icon="pi pi-exclamation-circle" outlined className="pp-boton-secundario" onClick={() => props.alObservar(d)} />
                <Button label="Rechazar" icon="pi pi-times" outlined className="pp-boton-rechazar" onClick={() => props.alRechazar(d)} />
                <Button
                  label="Aprobar"
                  icon="pi pi-check"
                  className="pp-boton-aprobar"
                  disabled={!d.verificado || !reconocidoValido}
                  tooltip={!d.verificado ? 'Primero comprueba la veracidad en el portal' : undefined}
                  tooltipOptions={{ showOnDisabled: true, position: 'top' }}
                  onClick={() => props.alAprobar(d, reconocido)}
                />
              </div>
            )}
          </footer>
        )}
      </div>
      <VentanaDocumento descanso={d} tipo={verTipo} alCerrar={() => setVerTipo(null)} />
    </Dialog>
  );
}
