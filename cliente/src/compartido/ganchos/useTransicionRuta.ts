import { useEffect, useRef, type RefObject } from 'react';

/**
 * Transición al cambiar de módulo o de pestaña: el contenido entra con un leve desvanecido y deslizamiento.
 * Usa la Web Animations API sobre el contenedor (no vuelve a montar la página, así no pierde su estado).
 * No anima la primera vez ni si el sistema pide reducir el movimiento.
 */
export function useTransicionRuta(contenedor: RefObject<HTMLElement>, clave: string, opciones: { subirAlInicio?: boolean; distancia?: number } = {}) {
  const anterior = useRef(clave);
  const { subirAlInicio = false, distancia = 12 } = opciones;

  useEffect(() => {
    if (anterior.current === clave) return;
    anterior.current = clave;
    const el = contenedor.current;
    if (!el) return;
    if (subirAlInicio) {
      el.scrollTo?.({ top: 0 });
      window.scrollTo({ top: 0 });
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !el.animate) return;
    // Si se cambia rápido de módulo, la transición anterior se descarta (no se acumulan).
    el.getAnimations?.().forEach((a) => a.id === 'transicion-ruta' && a.cancel());
    el.animate(
      [
        // Nunca parte de transparente del todo: si el navegador pausa la animación, el contenido igual se ve.
        { opacity: 0.25, transform: `translateY(${distancia}px)` },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { id: 'transicion-ruta', duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  }, [clave, contenedor, subirAlInicio, distancia]);
}
