/**
 * Fechas en hora local (Perú), sin pasar por UTC.
 *
 * `Date.toISOString()` convierte a UTC: lo registrado después de las 7 p. m. en Perú
 * quedaba con fecha del día siguiente, y los filtros no coincidían con la fecha mostrada.
 */
const dos = (n: number) => String(n).padStart(2, '0');

/** Date → "AAAA-MM-DD" en hora local. */
export const aDiaLocal = (d: Date) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;

/** Date → "AAAA-MM-DDTHH:mm:ss" en hora local (sin zona). */
export const aMomentoLocal = (d: Date) =>
  `${aDiaLocal(d)}T${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`;

/** Fecha actual "AAAA-MM-DD". */
export const hoyLocal = () => aDiaLocal(new Date());

/** Momento actual "AAAA-MM-DDTHH:mm:ss". */
export const ahoraLocal = () => aMomentoLocal(new Date());

/**
 * Día local de una fecha guardada: "AAAA-MM-DD", con hora local o en UTC (termina en Z o con desfase).
 * Las fechas en UTC se convierten a la hora local para que coincidan con lo que se muestra.
 */
export function diaLocalDe(fecha: string): string {
  return /(Z|[+-]\d{2}:\d{2})$/.test(fecha) ? aDiaLocal(new Date(fecha)) : fecha.slice(0, 10);
}

/**
 * Lo que ya ocurrió (envíos, firmas, aprobaciones) no puede quedar en el futuro:
 * si el momento es posterior a ahora, se usa ahora. Recibe y devuelve "AAAA-MM-DDTHH:mm:ss".
 */
export function noFuturo(momento: string): string {
  const ahora = ahoraLocal();
  return momento > ahora ? ahora : momento;
}
