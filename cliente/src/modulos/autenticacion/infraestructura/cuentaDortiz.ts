/**
 * Cuenta de prueba "dortiz" (rol trabajador). Los datos reales de la persona van en cliente/.env.local,
 * que no se sube al repositorio; aquí quedan solo datos ficticios de respaldo.
 */
const nombres = import.meta.env.VITE_DORTIZ_NOMBRES || 'Diego';
const apellidos = import.meta.env.VITE_DORTIZ_APELLIDOS || 'Ortiz Vega';

export const CUENTA_DORTIZ = {
  dni: import.meta.env.VITE_DORTIZ_DNI || '47302158',
  /** "Nombres Apellidos", para la sesión. */
  nombre: `${nombres} ${apellidos}`,
  /** "APELLIDOS, NOMBRES", como en la ficha del trabajador. */
  nombreFicha: `${apellidos}, ${nombres}`.toUpperCase(),
  /** "APELLIDOS NOMBRES", como en las boletas. */
  nombreBoleta: `${apellidos} ${nombres}`.toUpperCase(),
  cargo: 'Asistente de sistema',
  area: 'ADM SISTEMAS',
};
