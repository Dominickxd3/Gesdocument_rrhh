/** Modelo y reglas del módulo de papeletas de permiso (prototipo de diseño). */

export type EstadoPapeleta = 'pendiente' | 'aprobada' | 'rechazada' | 'anulada';

export type FiltroEstado = 'todas' | Exclude<EstadoPapeleta, 'anulada'>;

/**
 * "Considerar como": las mismas opciones del sistema de papeletas actual (catálogo tipos-permiso).
 * Es opcional: null = sin condición.
 */
export type TipoPermiso = 'medio_dia_vacaciones' | 'comision' | 'compensacion' | 'otros';

export const TIPOS_PERMISO: { valor: TipoPermiso; etiqueta: string; icono: string }[] = [
  { valor: 'medio_dia_vacaciones', etiqueta: '1/2 día a cuenta de vacaciones', icono: 'pi pi-sun' },
  { valor: 'comision', etiqueta: 'Comisión', icono: 'pi pi-briefcase' },
  { valor: 'compensacion', etiqueta: 'Compensación', icono: 'pi pi-sync' },
  { valor: 'otros', etiqueta: 'Otros', icono: 'pi pi-ellipsis-h' },
];

export const etiquetaTipo = (tipo: TipoPermiso | null) =>
  tipo ? (TIPOS_PERMISO.find((t) => t.valor === tipo)?.etiqueta ?? tipo) : 'Sin condición';

export interface Trabajador {
  dni: string;
  nombre: string;
  cargo: string;
  area: string;
}

export interface EventoHistorial {
  accion: 'creada' | 'editada' | 'aprobada' | 'rechazada' | 'anulada' | 'restaurada';
  usuario: string;
  fecha: string;
  nota?: string;
}

export interface Papeleta {
  id: string;
  numero: number;
  /** Fecha del permiso, AAAA-MM-DD. */
  fecha: string;
  trabajador: Trabajador;
  tipo: TipoPermiso | null;
  motivo: string;
  observaciones: string;
  /** HH:mm */
  salida: string;
  /** HH:mm; null = no retorna en el día. */
  retorno: string | null;
  estado: EstadoPapeleta;
  historial: EventoHistorial[];
}

export interface DatosPapeleta {
  fecha: string;
  trabajador: Trabajador;
  tipo: TipoPermiso | null;
  motivo: string;
  observaciones: string;
  salida: string;
  retorno: string | null;
}

export const MOTIVO_MAXIMO = 120;
export const OBSERVACIONES_MAXIMO = 300;

const aMinutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

/** Minutos fuera; null si no hay retorno o el retorno no es posterior a la salida. */
export function duracionMinutos(salida: string, retorno: string | null): number | null {
  if (!salida || !retorno) return null;
  const diferencia = aMinutos(retorno) - aMinutos(salida);
  return diferencia > 0 ? diferencia : null;
}

export function formatearDuracion(minutos: number | null): string {
  if (minutos === null) return '—';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** 14:05 → 2:05 p. m. */
export function formatearHora(hora: string): string {
  const [h, m] = hora.split(':').map(Number);
  const sufijo = h < 12 ? 'a. m.' : 'p. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

export const puedeImprimir = (p: Papeleta) => p.estado === 'aprobada';
export const puedeEditar = (p: Papeleta) => p.estado === 'pendiente';
export const puedeResolver = (p: Papeleta) => p.estado === 'pendiente';

export interface ResumenPapeletas {
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  /** Aprobadas de hoy que siguen sin retorno. */
  fueraAhora: number;
}

export function validarPapeleta(datos: DatosPapeleta): Partial<Record<keyof DatosPapeleta, string>> {
  const errores: Partial<Record<keyof DatosPapeleta, string>> = {};
  if (!datos.trabajador.dni) errores.trabajador = 'Elige un trabajador.';
  if (!datos.fecha) errores.fecha = 'Indica la fecha del permiso.';
  if (!datos.salida) errores.salida = 'Indica la hora de salida.';
  if (datos.retorno !== null && !datos.retorno) errores.retorno = 'Indica la hora de retorno o marca “No retorna”.';
  if (datos.retorno && duracionMinutos(datos.salida, datos.retorno) === null)
    errores.retorno = 'El retorno debe ser posterior a la salida.';
  if (!datos.motivo.trim()) errores.motivo = 'Escribe el motivo.';
  return errores;
}
