import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Insignia } from '@/compartido/componentes/Insignia';
import { BotonArchivo } from '@/compartido/componentes/BotonArchivo';
import { momento } from '@/compartido/almacen/crearAlmacen';
import { infoEstado, etiquetaTipo, ultimoEvento, type Documento, type EventoDocumento } from '../dominio/documento';
import { VistaDocumento } from './VistaDocumento';

const ACCIONES: Record<EventoDocumento['accion'], { texto: string; icono: string }> = {
  creado: { texto: 'preparó el documento', icono: 'pi pi-file' },
  enviado: { texto: 'lo envió para firma', icono: 'pi pi-send' },
  observado: { texto: 'lo observó', icono: 'pi pi-exclamation-circle' },
  corregido: { texto: 'subió una versión corregida', icono: 'pi pi-replay' },
  firmado: { texto: 'lo firmó electrónicamente', icono: 'pi pi-check' },
};

interface Propiedades {
  documento: Documento | null;
  /** RR. HH. prepara, envía y corrige; el trabajador firma u observa. */
  modo: 'rrhh' | 'trabajador';
  alCerrar: () => void;
  alEnviar?: (d: Documento) => void;
  alCorregir?: (d: Documento, archivo?: string) => void;
  alFirmar?: (d: Documento, imagen: string) => void;
  alObservar?: (d: Documento) => void;
}

/** Detalle del documento en ventana centrada, con su vista previa y las acciones según rol y estado. */
export function VentanaDocumento({ documento: d, modo, alCerrar, ...acciones }: Propiedades) {
  const [viendo, setViendo] = useState(false);
  const [acepto, setAcepto] = useState(false);
  const [firmando, setFirmando] = useState(false);
  if (!d) return null;

  const estado = infoEstado(d.estado);
  const observacion = ultimoEvento(d, 'observado');
  const firma = ultimoEvento(d, 'firmado');
  const esRrhh = modo === 'rrhh';

  return (
    <Dialog
      visible
      onHide={() => {
        setAcepto(false);
        alCerrar();
      }}
      showHeader={false}
      modal
      dismissableMask
      draggable={false}
      className="pp-panel"
      style={{ width: '540px' }}
      breakpoints={{ '640px': '94vw' }}
    >
      <div className="pp-panel__contenido">
        <header className="pp-panel__encabezado">
          <div>
            <span className="pp-panel__kicker">Documento N° {d.numero}</span>
            <h2 className="tr-nombre">{etiquetaTipo(d.tipo)}</h2>
          </div>
          <Insignia tono={estado.tono}>{estado.etiqueta}</Insignia>
          <Button icon="pi pi-times" text rounded aria-label="Cerrar" className="pp-panel__cerrar" onClick={alCerrar} />
        </header>

        {firma && (
          <div className="dm-resolucion es-aprobado">
            <i className="pi pi-check-circle" aria-hidden="true" />
            <div>
              <strong>Firmado por {firma.usuario}</strong>
              <small>{momento(firma.fecha)}</small>
            </div>
          </div>
        )}
        {d.estado === 'observado' && observacion && (
          <div className="dm-resolucion es-observado">
            <i className="pi pi-exclamation-circle" aria-hidden="true" />
            <div>
              <strong>Observado por {observacion.usuario}</strong>
              <small>{momento(observacion.fecha)}</small>
              {observacion.nota && <p>“{observacion.nota}”</p>}
            </div>
          </div>
        )}

        <dl className="pp-panel__datos">
          {esRrhh && (
            <div className="ancho-completo">
              <dt>Trabajador</dt>
              <dd>
                {d.trabajador} · DNI {d.dni}
              </dd>
            </div>
          )}
          <div>
            <dt>Versión</dt>
            <dd>v{d.version}</dd>
          </div>
          <div>
            <dt>Origen</dt>
            <dd>{d.origen.tipo === 'plantilla' ? 'Generado desde plantilla' : d.origen.nombre}</dd>
          </div>
        </dl>

        <Button label="Ver documento" icon="pi pi-eye" outlined className="pp-boton-secundario dm-boton-ancho" onClick={() => setViendo(true)} />

        {esRrhh && (
          <section>
            <h3 className="pp-panel__subtitulo">Historial</h3>
            <ol className="pp-linea-tiempo">
              {[...d.historial].reverse().map((h, i) => (
                <li key={i} className={h.accion === 'firmado' ? 'es-aprobada' : ''}>
                  <span className="pp-linea-tiempo__punto">
                    <i className={ACCIONES[h.accion].icono} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>
                      {h.usuario} · {ACCIONES[h.accion].texto}
                    </strong>
                    <small>{momento(h.fecha)}</small>
                    {h.nota && <p>“{h.nota}”</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {esRrhh && d.estado === 'preparacion' && (
          <footer className="pp-panel__pie">
            <Button label="Enviar al trabajador para firma" icon="pi pi-send" className="pp-boton-principal dm-boton-ancho" onClick={() => acciones.alEnviar?.(d)} />
          </footer>
        )}
        {esRrhh && d.estado === 'observado' && (
          <footer className="pp-panel__pie">
            <div className="pp-panel__decision">
              <BotonArchivo etiqueta="Subir versión corregida" clase="pp-boton-secundario p-button-outlined" alElegir={(nombre) => acciones.alCorregir?.(d, nombre)} />
              <Button label="Regenerar y reenviar" icon="pi pi-replay" className="pp-boton-principal" onClick={() => acciones.alCorregir?.(d)} />
            </div>
          </footer>
        )}
        {!esRrhh && d.estado === 'pendiente_firma' && (
          <footer className="pp-panel__pie">
            <label className="dm-verificacion">
              <Checkbox checked={acepto} onChange={(e) => setAcepto(!!e.checked)} />
              <span>
                <strong>Leí el documento y estoy de acuerdo</strong>
                <small>Al firmar, dibujarás tu firma sobre tu línea en el documento.</small>
              </span>
            </label>
            <div className="pp-panel__decision">
              <Button label="Observar" icon="pi pi-exclamation-circle" outlined className="pp-boton-secundario" onClick={() => acciones.alObservar?.(d)} />
              <Button label="Firmar" icon="pi pi-pencil" className="pp-boton-aprobar" disabled={!acepto} onClick={() => setFirmando(true)} />
            </div>
          </footer>
        )}
      </div>
      <VistaDocumento documento={d} visible={viendo} alCerrar={() => setViendo(false)} />
      <VistaDocumento
        documento={d}
        visible={firmando}
        alCerrar={() => setFirmando(false)}
        alFirmar={(imagen) => {
          setFirmando(false);
          acciones.alFirmar?.(d, imagen);
        }}
      />
    </Dialog>
  );
}

export const tituloDocumento = (d: Documento) => `${etiquetaTipo(d.tipo)}${d.version > 1 ? ` · v${d.version}` : ''}`;
