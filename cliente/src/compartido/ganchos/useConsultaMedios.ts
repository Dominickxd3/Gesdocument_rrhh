import { useEffect, useState } from 'react';

/** Devuelve si la consulta de medios CSS coincide, y se actualiza al redimensionar. */
export function useConsultaMedios(consulta: string): boolean {
  const [coincide, setCoincide] = useState(() => window.matchMedia(consulta).matches);

  useEffect(() => {
    const lista = window.matchMedia(consulta);
    const alCambiar = () => setCoincide(lista.matches);
    alCambiar();
    lista.addEventListener('change', alCambiar);
    return () => lista.removeEventListener('change', alCambiar);
  }, [consulta]);

  return coincide;
}
