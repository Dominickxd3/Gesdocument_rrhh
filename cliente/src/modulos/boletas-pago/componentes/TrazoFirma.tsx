/**
 * Trazo de firma de ejemplo del colaborador para el mockup.
 * En producción se reemplaza por la imagen de la firma que el colaborador hace en la plataforma.
 */
const TRAZO =
  'M10 48 C 22 18, 34 16, 36 40 S 52 62, 60 34 C 66 14, 74 20, 72 42 C 70 58, 86 52, 94 36 C 100 24, 108 30, 110 44 C 112 54, 124 50, 132 38 C 140 26, 150 30, 152 42 C 154 52, 168 48, 178 32 M 120 56 C 150 52, 180 50, 210 46';

export function TrazoFirma({ etiqueta }: { etiqueta: string }) {
  return (
    <svg viewBox="0 0 220 64" className="trazo-firma" role="img" aria-label={etiqueta}>
      <path d={TRAZO} fill="none" stroke="#1d2b5c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
