import { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { SUSTENTOS, diasPeriodo, etiquetaTipo, fechaCorta, type Descanso, type TipoSustento } from '../dominio/descanso';
import { guardarArchivo, ultimaObservacion, ultimaResolucion } from '../aplicacion/almacenDescansos';
import { VentanaDocumento } from './VentanaDocumento';

const formatoMomento = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
import { InsigniaEstado, Plazo } from './Insignias';

interface Propiedades {
  descanso: Descanso | null;
  alCerrar: () => void;
  alEnviar: (d: Descanso, nuevos: Partial<Record<TipoSustento, string>>) => void;
}

function BotonAdjuntar({ alElegir }: { alElegir: (nombre: string) => void }) {
  const entrada = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={entrada}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) alElegir(guardarArchivo(f));
          e.target.value = '';
        }}
      />
      <Button label="Adjuntar" icon="pi pi-upload" text size="small" onClick={() => entrada.current?.click()} />
    </>
  );
}

/**
 * Vista del trabajador (CUS20–CUS22): estado, observaciones de RR. HH. y subida de sustentos.
 * No muestra la verificación interna ni el historial de RR. HH.
 */
export function VentanaMiDescanso({ descanso: d, alCerrar, alEnviar }: Propiedades) {
  const [nuevos, setNuevos] = useState<Partial<Record<TipoSustento, string>>>({});
  const [verTipo, setVerTipo] = useState<TipoSustento | null>(null);
  useEffect(() => setNuevos({}), [d?.id, d?.estado]);

  if (!d) return <Dialog visible={false} onHide={alCerrar} />;

  const puedeSubir = d.estado === 'aviso' || d.estado === 'observado';
  const sustentos = { ...d.sustentos, ...nuevos };
  const nota = ultimaObservacion(d);
  const resolucion = ultimaResolucion(d);
  const quien = resolucion && `Por ${resolucion.usuario} · ${formatoMomento.format(new Date(resolucion.fecha))}`;

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
      style={{ width: '520px' }}
      breakpoints={{ '640px': '94vw' }}
    >
      <div className="pp-panel__contenido">
        <header className="pp-panel__encabezado">
          <div>
            <span className="pp-panel__kicker">Mi descanso médico</span>
            <h2>N° {d.numero}</h2>
          </div>
          <InsigniaEstado estado={d.estado} />
          <Button icon="pi pi-times" text rounded aria-label="Cerrar" className="pp-panel__cerrar" onClick={alCerrar} />
        </header>

        {d.estado === 'observado' && (
          <div className="dm-mensaje es-observado">
            <i className="pi pi-exclamation-circle" aria-hidden="true" />
            <div>
              <strong>RR. HH. observó tu sustento</strong>
              <small>{quien}</small>
              <p>{nota}</p>
              <small>
                Sube el documento corregido · <Plazo descanso={d} />
              </small>
            </div>
          </div>
        )}
        {d.estado === 'aviso' && (
          <div className="dm-mensaje">
            <i className="pi pi-clock" aria-hidden="true" />
            <div>
              <strong>Falta presentar tu certificado médico o CITT</strong>
              <small>
                <Plazo descanso={d} />
              </small>
            </div>
          </div>
        )}
        {d.estado === 'pendiente_revision' && (
          <div className="dm-mensaje">
            <i className="pi pi-hourglass" aria-hidden="true" />
            <div>
              <strong>RR. HH. está revisando tus documentos</strong>
              <small>Te avisaremos cuando haya un resultado.</small>
            </div>
          </div>
        )}
        {d.estado === 'aprobado' && d.reconocido && (
          <div className="dm-mensaje es-aprobado">
            <i className="pi pi-check-circle" aria-hidden="true" />
            <div>
              <strong>Descanso aprobado</strong>
              <small>{quien}</small>
              <small>
                Días reconocidos: {fechaCorta(d.reconocido.inicio)} – {fechaCorta(d.reconocido.fin)} (
                {diasPeriodo(d.reconocido.inicio, d.reconocido.fin)} días)
              </small>
            </div>
          </div>
        )}
        {d.estado === 'rechazado' && (
          <div className="dm-mensaje es-rechazado">
            <i className="pi pi-times-circle" aria-hidden="true" />
            <div>
              <strong>Descanso rechazado</strong>
              <small>{quien}</small>
              <p>{nota}</p>
            </div>
          </div>
        )}

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
            <span>Días</span>
            <strong>{diasPeriodo(d.inicio, d.fin)}</strong>
          </div>
        </section>

        <dl className="pp-panel__datos">
          <div>
            <dt>Tipo</dt>
            <dd>{etiquetaTipo(d.tipo)}</dd>
          </div>
          <div>
            <dt>Centro médico</dt>
            <dd>{d.centroMedico || '—'}</dd>
          </div>
        </dl>

        <section>
          <h3 className="pp-panel__subtitulo">Mis documentos</h3>
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
                  {d.sustentos[s.tipo] && <Button label="Ver" icon="pi pi-eye" text size="small" onClick={() => setVerTipo(s.tipo)} />}
                  {/* Lo recién adjuntado se puede quitar o cambiar mientras no se envíe. */}
                  {puedeSubir && nuevos[s.tipo] && (
                    <Button
                      icon="pi pi-times"
                      text
                      rounded
                      size="small"
                      aria-label="Quitar archivo"
                      onClick={() =>
                        setNuevos((n) => {
                          const resto = { ...n };
                          delete resto[s.tipo];
                          return resto;
                        })
                      }
                    />
                  )}
                  {puedeSubir && <BotonAdjuntar alElegir={(nombre) => setNuevos((n) => ({ ...n, [s.tipo]: nombre }))} />}
                </li>
              );
            })}
          </ul>
        </section>

        {puedeSubir && (
          <footer className="pp-panel__pie">
            <Button
              label={d.estado === 'observado' ? 'Enviar documentos corregidos' : 'Enviar a RR. HH.'}
              icon="pi pi-send"
              className="pp-boton-principal dm-boton-ancho"
              disabled={!sustentos.certificado || Object.keys(nuevos).length === 0}
              tooltip={!sustentos.certificado ? 'Adjunta tu certificado médico o CITT' : undefined}
              tooltipOptions={{ showOnDisabled: true, position: 'top' }}
              onClick={() => alEnviar(d, nuevos)}
            />
          </footer>
        )}
      </div>
      <VentanaDocumento descanso={d} tipo={verTipo} alCerrar={() => setVerTipo(null)} />
    </Dialog>
  );
}
