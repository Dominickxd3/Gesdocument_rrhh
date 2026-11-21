import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/** Ancho y alto de una hoja A4 a 96 ppp. */
export const ANCHO_HOJA = 794;
export const ALTO_HOJA = 1123;

/**
 * Muestra la hoja a su tamaño real y la reduce proporcionalmente si el espacio es menor,
 * para que en celular se vea igual que el PDF sin desordenar la cuadrícula.
 */
export function HojaEscalable({ children, zoom = 1 }: { children: ReactNode; /** Acercar o alejar (p. ej. al firmar). */ zoom?: number }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const [ajuste, setAjuste] = useState(1);
  const escala = ajuste * zoom;

  useLayoutEffect(() => {
    const elemento = contenedor.current;
    if (!elemento) return;
    const observador = new ResizeObserver(([entrada]) => {
      setAjuste(Math.min(1, (entrada?.contentRect.width ?? ANCHO_HOJA) / ANCHO_HOJA));
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    // Con zoom mayor al ajuste, la hoja crece y el marco permite desplazarse hacia los lados.
    <div ref={contenedor} className="hoja-escalable-marco">
      <div className="hoja-escalable" style={{ width: ANCHO_HOJA * escala, height: ALTO_HOJA * escala, maxWidth: 'none' }}>
        <div className="hoja-escalable__hoja" style={{ transform: `scale(${escala})` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
