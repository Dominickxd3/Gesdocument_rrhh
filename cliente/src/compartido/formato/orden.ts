/**
 * Regla de todos los módulos: las listas se muestran en orden alfabético por trabajador
 * ("APELLIDOS, NOMBRES"), sin distinguir tildes ni mayúsculas.
 * Si es el mismo trabajador, primero el registro más reciente (N° mayor).
 */
const comparador = new Intl.Collator('es', { sensitivity: 'base' });

export function ordenarPorTrabajador<T>(lista: T[], nombre: (x: T) => string, numero?: (x: T) => number): T[] {
  return [...lista].sort((a, b) => comparador.compare(nombre(a), nombre(b)) || (numero ? numero(b) - numero(a) : 0));
}
