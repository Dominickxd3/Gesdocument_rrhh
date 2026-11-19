import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';
import { duracionMinutos, etiquetaTipo, type Papeleta } from '../dominio/papeleta';

interface Propiedades {
  papeleta: Papeleta | null;
  alCerrar: () => void;
}

type Papel = 'A5' | 'A4';

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

function Copia({ p, copia }: { p: Papeleta; copia: string }) {
  const emision = p.historial[0]?.fecha ?? p.fecha;
  const jefe = p.historial.find((h) => h.accion === 'creada')?.usuario ?? '';
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
          <span className="pp-copia__linea">V°B° Gestion Humana</span>
        </div>
        <div>
          <span className="pp-copia__linea">Colaborador</span>
        </div>
      </div>
    </section>
  );
}

/** Vista previa del formato impreso. A5 llena la hoja; A4 deja márgenes, igual que los modelos PDF. */
export function VentanaImpresion({ papeleta: p, alCerrar }: Propiedades) {
  const [papel, setPapel] = useState<Papel>('A5');

  return (
    <Dialog
      visible={!!p}
      onHide={alCerrar}
      header="Vista previa de impresión"
      className="pp-ventana pp-ventana-impresion"
      style={{ width: '980px' }}
      breakpoints={{ '1024px': '96vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <SelectButton value={papel} options={['A5', 'A4']} onChange={(e) => e.value && setPapel(e.value)} allowEmpty={false} />
          <span className="pp-espaciador" />
          <Button label="Cerrar" text onClick={alCerrar} />
          <Button label="Imprimir" icon="pi pi-print" className="pp-boton-principal" onClick={() => window.print()} />
        </div>
      }
    >
      {p && (
        <div className="pp-hoja-contenedor">
          {/* Tamaño de página para la impresora: siempre horizontal. */}
          <style>{`@page { size: ${papel} landscape; margin: 0; }`}</style>
          <article className={`pp-hoja papel-${papel}`} id="pp-hoja-imprimible">
            <div className="pp-hoja__cuerpo">
              {COPIAS.map((copia, i) => (
                <div key={copia} className="pp-hoja__bloque">
                  {i > 0 && <hr className="pp-hoja__corte" />}
                  <Copia p={p} copia={copia} />
                </div>
              ))}
            </div>
          </article>
        </div>
      )}
    </Dialog>
  );
}
