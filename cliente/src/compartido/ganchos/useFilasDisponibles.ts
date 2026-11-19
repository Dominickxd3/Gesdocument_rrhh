import { useLayoutEffect, useRef, useState } from 'react';

const ALTO_EXTRA = 44 + 48 + 32; // encabezado de la tabla + paginación + margen inferior

/**
 * Cuántas filas caben en el espacio que queda bajo la tarjeta de la tabla,
 * para que la tabla llene la pantalla sin dejar hueco ni barra de desplazamiento.
 * Mide la altura real de las filas (cambia según la tabla); `altoFila` es solo el valor inicial.
 */
export function useFilasDisponibles<T extends HTMLElement = HTMLDivElement>(altoFila = 59) {
  const ref = useRef<T>(null);
  const [filas, setFilas] = useState(10);
  const medirRef = useRef<() => void>(() => {});

  medirRef.current = () => {
    const tarjeta = ref.current;
    if (!tarjeta) return;
    const fila = tarjeta.querySelector<HTMLElement>('tbody tr:not(.p-datatable-emptymessage)');
    const alto = fila?.offsetHeight || altoFila;
    const encabezado = tarjeta.querySelector<HTMLElement>('thead')?.offsetHeight ?? 44;
    const disponible = window.innerHeight - tarjeta.getBoundingClientRect().top - (ALTO_EXTRA - 44) - encabezado;
    const siguiente = Math.max(5, Math.floor(disponible / alto));
    setFilas((actual) => (actual === siguiente ? actual : siguiente));
  };

  // Se vuelve a medir tras cada dibujo (cambian los datos o la altura de las filas) y al redimensionar.
  useLayoutEffect(() => medirRef.current());
  useLayoutEffect(() => {
    const medir = () => medirRef.current();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  return { ref, filas };
}
