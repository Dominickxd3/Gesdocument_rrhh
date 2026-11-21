import { useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import './selectorTrabajador.css';

export interface OpcionTrabajador {
  dni: string;
  nombre: string;
  /** Línea secundaria: cargo, área… */
  detalle: string;
}

interface Propiedades {
  opciones: OpcionTrabajador[];
  /** DNI elegido; null = ninguno. */
  valor: string | null;
  alCambiar: (dni: string | null) => void;
  etiqueta?: string;
  /** Oculta "Cambiar" cuando el trabajador no debe cambiarse (p. ej. al editar). */
  fijo?: boolean;
  error?: string;
}

/** Quita tildes y pasa a minúsculas para comparar ("CHÁVEZ" → "chavez"). */
export const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const iniciales = (nombre: string) => {
  const [apellidos, nombres = ''] = nombre.split(',');
  return `${nombres.trim()[0] ?? ''}${apellidos.trim()[0] ?? ''}`;
};

/**
 * Buscador único de trabajadores: se escribe nombre o DNI en el mismo campo (sin un segundo buscador dentro de la lista).
 * Al elegir, se muestra la tarjeta del trabajador con "Cambiar". Mismo patrón en todos los formularios.
 */
export function SelectorTrabajador({ opciones, valor, alCambiar, etiqueta = 'Trabajador *', fijo, error }: Propiedades) {
  const [texto, setTexto] = useState<string | OpcionTrabajador>('');
  const [sugerencias, setSugerencias] = useState<OpcionTrabajador[]>([]);
  const elegido = opciones.find((o) => o.dni === valor);

  if (elegido) {
    return (
      <div className="pp-campo">
        <span className="pp-campo__etiqueta">{etiqueta}</span>
        <div className="pp-trabajador-elegido">
          <span className="pp-avatar" aria-hidden="true">
            {iniciales(elegido.nombre)}
          </span>
          <div>
            <strong>{elegido.nombre}</strong>
            <small>
              DNI {elegido.dni} · {elegido.detalle}
            </small>
          </div>
          {!fijo && (
            <Button
              label="Cambiar"
              text
              size="small"
              onClick={() => {
                setTexto('');
                alCambiar(null);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <label className="pp-campo">
      <span className="pp-campo__etiqueta">{etiqueta}</span>
      <AutoComplete
        value={texto}
        suggestions={sugerencias}
        completeMethod={(e) => {
          // Sin distinguir tildes ni mayúsculas: "chavez" encuentra "CHÁVEZ".
          const q = normalizar(e.query.trim());
          setSugerencias(opciones.filter((o) => normalizar(o.nombre).includes(q) || o.dni.includes(q)).slice(0, 8));
        }}
        field="nombre"
        onChange={(e) => setTexto(e.value)}
        onSelect={(e) => alCambiar((e.value as OpcionTrabajador).dni)}
        itemTemplate={(o: OpcionTrabajador) => (
          <div className="pp-sugerencia">
            <span className="pp-avatar" aria-hidden="true">
              {iniciales(o.nombre)}
            </span>
            <div>
              <strong>{o.nombre}</strong>
              <small>
                DNI {o.dni} · {o.detalle}
              </small>
            </div>
          </div>
        )}
        placeholder="Escribe el nombre o DNI"
        emptyMessage="Ningún trabajador coincide"
        showEmptyMessage
        className={error ? 'p-invalid' : ''}
        inputClassName="pp-ancho-completo"
        panelClassName="selector-trabajador__panel"
      />
      {error && <small className="pp-campo__error">{error}</small>}
    </label>
  );
}
