/**
 * Modelo y reglas de descansos médicos (prototipo de diseño).
 * Basado en el informe: RF13, RF14, CUS19–CUS28 y el BPMN de descansos médicos.
 */

/**
 * aviso: el trabajador avisó la ausencia; falta presentar sustentos (plazo 3 días hábiles).
 * pendiente_revision: sustentos recibidos; RR. HH. debe revisarlos.
 * observado: falta documentación; el trabajador debe regularizar (plazo 1 día hábil).
 * aprobado / rechazado: resultado final.
 */
export type EstadoDescanso = 'aviso' | 'pendiente_revision' | 'observado' | 'aprobado' | 'rechazado';

export const ESTADOS_DESCANSO: { valor: EstadoDescanso; etiqueta: string }[] = [
  { valor: 'aviso', etiqueta: 'Aviso registrado' },
  { valor: 'pendiente_revision', etiqueta: 'Pendiente de revisión' },
  { valor: 'observado', etiqueta: 'Observado' },
  { valor: 'aprobado', etiqueta: 'Aprobado' },
  { valor: 'rechazado', etiqueta: 'Rechazado' },
];

export const etiquetaEstado = (e: EstadoDescanso) => ESTADOS_DESCANSO.find((x) => x.valor === e)?.etiqueta ?? e;

export type TipoDescanso = 'enfermedad' | 'accidente';

export const TIPOS_DESCANSO: { valor: TipoDescanso; etiqueta: string; icono: string }[] = [
  { valor: 'enfermedad', etiqueta: 'Enfermedad', icono: 'pi pi-heart' },
  { valor: 'accidente', etiqueta: 'Accidente', icono: 'pi pi-exclamation-triangle' },
];

export const etiquetaTipo = (t: TipoDescanso) => TIPOS_DESCANSO.find((x) => x.valor === t)?.etiqueta ?? t;

export type TipoSustento = 'certificado' | 'constancia';

/** Documentos sustentatorios. El certificado (o CITT) es obligatorio. */
export const SUSTENTOS: { tipo: TipoSustento; etiqueta: string; obligatorio: boolean }[] = [
  { tipo: 'certificado', etiqueta: 'Certificado médico o CITT', obligatorio: true },
  { tipo: 'constancia', etiqueta: 'Constancia de atención o receta', obligatorio: false },
];

export interface Trabajador {
  dni: string;
  nombre: string;
  cargo: string;
  area: string;
}

export interface EventoHistorial {
  accion: 'aviso' | 'sustento' | 'verificado' | 'observado' | 'aprobado' | 'rechazado';
  usuario: string;
  fecha: string;
  nota?: string;
}

export interface Descanso {
  id: string;
  numero: number;
  trabajador: Trabajador;
  tipo: TipoDescanso;
  /** AAAA-MM-DD */
  inicio: string;
  fin: string;
  centroMedico: string;
  /** Confidencial: solo RR. HH. (RNF02). */
  diagnostico: string;
  /** Nombre del archivo recibido por tipo de sustento; ausente = no presentado. */
  sustentos: Partial<Record<TipoSustento, string>>;
  /** RR. HH. comprobó la veracidad en el portal correspondiente. */
  verificado: boolean;
  /** Fecha límite (AAAA-MM-DD) para que el trabajador presente o regularice. */
  plazo: string | null;
  /** Periodo que RR. HH. reconoce al aprobar; puede ser menor al solicitado. */
  reconocido: { inicio: string; fin: string } | null;
  estado: EstadoDescanso;
  historial: EventoHistorial[];
}

export interface DatosAviso {
  trabajador: Trabajador;
  tipo: TipoDescanso;
  inicio: string;
  fin: string;
  centroMedico: string;
  diagnostico: string;
  sustentos: Partial<Record<TipoSustento, string>>;
}

/** Plazos configurados del BPMN, en días hábiles. */
export const PLAZO_PRESENTAR = 3;
export const PLAZO_REGULARIZAR = 1;

const aFecha = (iso: string) => new Date(`${iso}T12:00:00`);
const aIso = (d: Date) => d.toISOString().slice(0, 10);

/** Días calendario del periodo, incluyendo inicio y fin. */
export function diasPeriodo(inicio: string, fin: string): number {
  if (!inicio || !fin) return 0;
  const dias = Math.round((aFecha(fin).getTime() - aFecha(inicio).getTime()) / 86400000) + 1;
  return dias > 0 ? dias : 0;
}

/** Suma días hábiles (lunes a viernes). */
export function sumarDiasHabiles(desde: string, dias: number): string {
  const d = aFecha(desde);
  let restantes = dias;
  while (restantes > 0) {
    d.setDate(d.getDate() + 1);
    const dia = d.getDay();
    if (dia !== 0 && dia !== 6) restantes--;
  }
  return aIso(d);
}

/** Días que faltan para el plazo (negativo = vencido); null si no espera al trabajador. */
export function diasParaPlazo(descanso: Descanso, hoy: string): number | null {
  if (!descanso.plazo || (descanso.estado !== 'aviso' && descanso.estado !== 'observado')) return null;
  return Math.round((aFecha(descanso.plazo).getTime() - aFecha(hoy).getTime()) / 86400000);
}

export const tieneCertificado = (d: { sustentos: Descanso['sustentos'] }) => !!d.sustentos.certificado;

const formatoCorto = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' });
export const fechaCorta = (iso: string) => formatoCorto.format(aFecha(iso)).replace('.', '');

export function validarAviso(datos: DatosAviso): Partial<Record<keyof DatosAviso, string>> {
  const errores: Partial<Record<keyof DatosAviso, string>> = {};
  if (!datos.trabajador.dni) errores.trabajador = 'Elige un trabajador.';
  if (!datos.inicio) errores.inicio = 'Indica la fecha de inicio.';
  if (!datos.fin) errores.fin = 'Indica la fecha de fin.';
  if (datos.inicio && datos.fin && diasPeriodo(datos.inicio, datos.fin) === 0)
    errores.fin = 'La fecha de fin debe ser igual o posterior al inicio.';
  return errores;
}
