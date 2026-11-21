import { useRef, useState } from 'react';
import { LienzoFirma, type ControlFirma } from '@/compartido/componentes/LienzoFirma';
import { TrazoFirma } from '@/modulos/boletas-pago/componentes/TrazoFirma';
import { guardarComoPdf, nombreArchivo } from '@/compartido/documentos/guardarComoPdf';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { duracionMinutos, etiquetaTipo, type Papeleta, numeroPapeleta } from '../dominio/papeleta';

interface Propiedades {
  papeleta: Papeleta | null;
  alCerrar: () => void;
}

/**
 * Formato oficial de la papeleta (modelo PDF del sistema actual):
 * hoja horizontal con dos copias iguales, "Copia para Colaborador" y "Copia para Vigilancia".
 */
const COPIAS = ['Copia para Colaborador', 'Copia para Vigilancia'];

const dd = (n: number) => String(n).padStart(2, '0');

/** AAAA-MM-DD o ISO → DD/MM/AAAA */
function fechaCorta(valor: string) {
  const d = new Date(valor.length === 10 ? `${valor}T12:00:00` : valor);
  return `${dd(d.getDate())}/${dd(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** HH:mm → HH:mm:00, como en el PDF. */
const horaLarga = (hora: string) => `${hora}:00`;

function tiempoLargo(minutos: number | null) {
  if (minutos === null) return '';
  return `${dd(Math.floor(minutos / 60))}:${dd(minutos % 60)}:00`;
}

/** Una copia de la papeleta impresa. Control de salidas muestra la "Copia para Vigilancia". */
export function CopiaPapeleta({ p, copia, controlFirma }: { p: Papeleta; copia: string; /** El colaborador está firmando: su línea es el espacio para dibujar. */ controlFirma?: ControlFirma }) {
  const emision = p.historial[0]?.fecha ?? p.fecha;
  const jefe = p.historial.find((h) => h.accion === 'creada')?.usuario ?? '';
  // Visto bueno de Gestión Humana: queda al aprobarse la papeleta.
  const aprobacion = p.estado === 'aprobada' ? [...p.historial].reverse().find((h) => h.accion === 'aprobada') : undefined;
  const firma = p.firmaColaborador;
  const filas: [string, string][] = [
    ['DOI:', p.trabajador.dni],
    ['Nombres y Apellidos:', p.trabajador.nombre],
    ['Cargo:', p.trabajador.cargo],
    ['Area:', p.trabajador.area],
    ['Motivo del permiso:', p.motivo.toUpperCase()],
    ['A considerar:', p.tipo ? etiquetaTipo(p.tipo) : ''],
  ];

  return (
    <section className="pp-copia">
      <div className="pp-copia__izquierda">
        <h2 className="pp-copia__titulo">PAPELETA DE PERMISO N° {String(p.numero).padStart(4, '0')}</h2>
        <dl className="pp-copia__datos">
          {filas.map(([etiqueta, valor]) => (
            <div key={etiqueta}>
              <dt>{etiqueta}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="pp-copia__derecha">
        <div className="pp-copia__fecha">
          <strong>Fecha Emision:</strong>
          <span className="pp-copia__caja">{fechaCorta(emision)}</span>
        </div>
        <div className="pp-copia__fecha">
          <strong>Fecha Permiso:</strong>
          <span className="pp-copia__caja">{fechaCorta(p.fecha)}</span>
        </div>
        <strong className="pp-copia__duracion">Duracion del Permiso:</strong>
        <div className="pp-copia__hora">
          <strong>Salida:</strong>
          <span className="pp-copia__caja">{horaLarga(p.salida)}</span>
        </div>
        <div className="pp-copia__hora">
          <strong>Retorno:</strong>
          <span className="pp-copia__caja">{p.retorno ? horaLarga(p.retorno) : 'Sin retorno'}</span>
        </div>
        <div className="pp-copia__hora">
          <strong>Tiempo:</strong>
          <span className="pp-copia__caja">{tiempoLargo(duracionMinutos(p.salida, p.retorno))}</span>
        </div>
        <span className="pp-copia__tipo-copia">{copia}</span>
      </div>

      <div className="pp-copia__firmas">
        <div>
          <img src="/isotipo-empresa.png" alt="" className="pp-copia__logo" />
          <span className="pp-copia__firmante">{jefe}</span>
          <span className="pp-copia__linea">V°B° Jefe Inmediato</span>
        </div>
        <div>
          {aprobacion && (
            <span className="pp-copia__visto">
              <span className="pp-copia__visto-marca" aria-hidden="true">✓</span> {aprobacion.usuario}
            </span>
          )}
          <span className="pp-copia__linea">V°B° Gestion Humana</span>
        </div>
        <div>
          {firma ? (
            firma.imagen ? (
              <img src={firma.imagen} alt={`Firma de ${p.trabajador.nombre}`} className="pp-copia__firma" />
            ) : (
              <span className="pp-copia__firma">
                <TrazoFirma etiqueta={`Firma de ${p.trabajador.nombre}`} />
              </span>
            )
          ) : (
            controlFirma && <LienzoFirma control={controlFirma} />
          )}
          <span className="pp-copia__linea">Colaborador</span>
        </div>
      </div>
    </section>
  );
}

/**
 * Papeleta en formato oficial (las dos copias), para ver y descargar en PDF.
 * Ya no se imprime: se muestra en digital y se guarda como archivo si hace falta.
 */
export function VentanaImpresion({ papeleta: p, alCerrar }: Propiedades) {
  const hoja = useRef<HTMLElement>(null);
  const [descargando, setDescargando] = useState(false);

  const descargar = async () => {
    if (!p) return;
    setDescargando(true);
    await guardarComoPdf(hoja.current, nombreArchivo('Papeleta', `N° ${String(p.numero).padStart(4, '0')}`, p.trabajador.nombre));
    setDescargando(false);
  };

  return (
    <Dialog
      visible={!!p}
      onHide={alCerrar}
      header={p ? `Papeleta de permiso N° ${numeroPapeleta(p.numero)}` : ''}
      className="pp-ventana pp-ventana-impresion"
      style={{ width: '980px' }}
      breakpoints={{ '1024px': '96vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Descargar PDF" icon="pi pi-download" outlined className="pp-boton-secundario" loading={descargando} onClick={() => void descargar()} />
          <span className="pp-espaciador" />
          <Button label="Cerrar" className="pp-boton-principal" onClick={alCerrar} />
        </div>
      }
    >
      {p && (
        <div className="pp-hoja-contenedor">
          <article className="pp-hoja papel-A5" id="pp-hoja-imprimible" ref={hoja}>
            <div className="pp-hoja__cuerpo">
              {COPIAS.map((copia, i) => (
                <div key={copia} className="pp-hoja__bloque">
                  {i > 0 && <hr className="pp-hoja__corte" />}
                  <CopiaPapeleta p={p} copia={copia} />
                </div>
              ))}
            </div>
          </article>
        </div>
      )}
    </Dialog>
  );
}
