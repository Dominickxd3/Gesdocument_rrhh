import { useLocation, useNavigate } from 'react-router-dom';
import './botonVolver.css';

interface Propiedades {
  /** Pantalla a la que vuelve si se llegó directo (sin historial dentro de la aplicación). */
  destino: string;
  etiqueta?: string;
}

/** Lo que la pantalla de origen envía al navegar, para que el botón diga a dónde vuelve. */
export interface Origen {
  volverA: string;
}

/**
 * Botón para retroceder: vuelve a la pantalla anterior o, si no hay, a `destino`.
 * Si la pantalla anterior avisó su nombre (estado `volverA`), el texto lo dice: "Volver a Inicio".
 */
export function BotonVolver({ destino, etiqueta = 'Volver' }: Propiedades) {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  // React Router guarda en history.state.idx cuántas pantallas se recorrieron en la aplicación.
  const origen = (ubicacion.state as Origen | null)?.volverA;
  // Si la pantalla anterior se anunció, hay a dónde volver aunque el contador del historial falle.
  const hayAnterior = (((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0 && ubicacion.key !== 'default') || !!origen;
  const texto = hayAnterior && origen ? `Volver a ${origen}` : etiqueta;

  return (
    <button type="button" className="boton-volver" onClick={() => (hayAnterior ? navegar(-1) : navegar(destino))}>
      <i className="pi pi-arrow-left" aria-hidden="true" />
      {texto}
    </button>
  );
}
