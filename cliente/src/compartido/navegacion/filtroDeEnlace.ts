/**
 * Filtros que llegan en el enlace (?dni=…&desde=…&hasta=…&anio=…&mes=…).
 * Los usa el Inicio para abrir un módulo ya filtrado por un trabajador y un periodo.
 */
export interface FiltroDeEnlace {
  dni?: string;
  /** AAAA-MM-DD */
  desde?: string;
  hasta?: string;
  anio?: number;
  mes?: number;
}

export function leerFiltroDeEnlace(): FiltroDeEnlace {
  const p = new URLSearchParams(window.location.search);
  const numero = (clave: string) => (p.get(clave) ? Number(p.get(clave)) : undefined);
  return {
    dni: p.get('dni') ?? undefined,
    desde: p.get('desde') ?? undefined,
    hasta: p.get('hasta') ?? undefined,
    anio: numero('anio'),
    mes: numero('mes'),
  };
}

export function enlaceConFiltro(ruta: string, filtro: FiltroDeEnlace): string {
  const p = new URLSearchParams();
  Object.entries(filtro).forEach(([clave, valor]) => valor !== undefined && p.set(clave, String(valor)));
  return `${ruta}?${p.toString()}`;
}
