import { useEffect, useState } from 'react';
import './pantallaCarga.css';

const DURACION_MS = 1300;
const SALIDA_MS = 300;

/**
 * Pantalla breve al iniciar sesión: logo y una barra de avance mientras detrás se arma el espacio
 * del usuario (menú, pendientes y datos). Desaparece sola, con un fundido.
 */
export function PantallaCarga({ nombre, alTerminar }: { nombre: string; alTerminar: () => void }) {
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const salir = setTimeout(() => setSaliendo(true), DURACION_MS);
    const fin = setTimeout(alTerminar, DURACION_MS + SALIDA_MS);
    return () => {
      clearTimeout(salir);
      clearTimeout(fin);
    };
  }, [alTerminar]);

  return (
    <div className={`pantalla-carga${saliendo ? ' es-saliendo' : ''}`} role="status" aria-live="polite">
      <img src="/isotipo-empresa.png" alt="" className="pantalla-carga__logo" />
      <strong className="pantalla-carga__titulo">Gestión Documental RR. HH.</strong>
      <span className="pantalla-carga__texto">{nombre ? `Hola, ${nombre}. Preparando tu espacio…` : 'Preparando tu espacio…'}</span>
      <span className="pantalla-carga__barra" aria-hidden="true">
        <span />
      </span>
    </div>
  );
}
