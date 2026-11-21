import { useLocation, useNavigate } from 'react-router-dom';
import './botonVolver.css';

interface Propiedades {
  /** Pantalla a la que vuelve si se llegó directo (sin historial dentro de la aplicación). */
  destino: string;
  etiqueta?: string;
}

/** Botón para retroceder: vuelve a la pantalla anterior o, si no hay, a `destino`. */
export function BotonVolver({ destino, etiqueta = 'Volver' }: Propiedades) {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  // React Router guarda en history.state.idx cuántas pantallas se recorrieron en la aplicación.
  const hayAnterior = ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0 && ubicacion.key !== 'default';

  return (
    <button type="button" className="boton-volver" onClick={() => (hayAnterior ? navegar(-1) : navegar(destino))}>
      <i className="pi pi-arrow-left" aria-hidden="true" />
      {etiqueta}
    </button>
  );
}
