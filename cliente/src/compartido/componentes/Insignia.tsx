import './insignia.css';

export type TonoInsignia = 'gris' | 'ambar' | 'azul' | 'verde' | 'rojo';

/** Estado en forma de píldora, con una paleta corta común a todos los módulos. */
export function Insignia({ tono, children }: { tono: TonoInsignia; children: React.ReactNode }) {
  return <span className={`insignia tono-${tono}`}>{children}</span>;
}
