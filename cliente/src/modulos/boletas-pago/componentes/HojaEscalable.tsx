import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/** Ancho y alto de una hoja A4 a 96 ppp. */
export const ANCHO_HOJA = 794;
export const ALTO_HOJA = 1123;

/**
 * Muestra la hoja a su tamaño real y la reduce proporcionalmente si el espacio es menor,
 * para que en celular se vea igual que el PDF sin desordenar la cuadrícula.
 */
export function HojaEscalable({ children }: { children: ReactNode }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);

  useLayoutEffect(() => {
    const elemento = contenedor.current;
    if (!elemento) return;
    const observador = new ResizeObserver(([entrada]) => {
      setEscala(Math.min(1, (entrada?.contentRect.width ?? ANCHO_HOJA) / ANCHO_HOJA));
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <div ref={contenedor} className="hoja-escalable" style={{ height: ALTO_HOJA * escala }}>
      <div className="hoja-escalable__hoja" style={{ transform: `scale(${escala})` }}>
        {children}
      </div>
    </div>
  );
}
