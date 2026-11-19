/** Ficha del trabajador (RF01 consultar y vincular trabajadores, RF02 gestionar jefaturas). */
export interface Trabajador {
  dni: string;
  /** "APELLIDOS, NOMBRES", como en el ERP. */
  nombre: string;
  area: string;
  cargo: string;
  correo: string;
  telefono: string;
  sede: string;
  fechaIngreso: string;
  /** Jefe inmediato (RF02); los cambios quedan en `historialJefes`. */
  jefe: string;
  historialJefes: { jefe: string; desde: string }[];
}

/** "QUISPE ROJAS, JOSÉ" → "José Quispe Rojas" */
export function nombreLegible(nombre: string) {
  const [apellidos, nombres = ''] = nombre.split(',');
  const capital = (t: string) => t.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase());
  return capital(`${nombres.trim()} ${apellidos.trim()}`.trim());
}

/** "QUISPE ROJAS, JOSÉ" → "JQ" */
export function iniciales(nombre: string) {
  const [apellidos, nombres = ''] = nombre.split(',');
  return `${nombres.trim()[0] ?? ''}${apellidos.trim()[0] ?? ''}`;
}
