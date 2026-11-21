/** Modelo de dominio del módulo de boletas de pago. */

export type EstadoFirma = 'pendiente' | 'firmada';
/** La boleta se publica en la cuenta del colaborador dentro de la plataforma. */
export type EstadoEnvio = 'no_enviado' | 'enviado';
export type EstadoPeriodo = 'en_curso' | 'cerrado';

export interface Periodo {
  anio: number;
  /** 1 = enero … 12 = diciembre. */
  mes: number;
  estado: EstadoPeriodo;
}

export interface Empresa {
  razonSocial: string;
  ruc: string;
  direccion: string;
}

/** Datos que aparecen en todas las boletas y se editan en "Configuración de boletas". */
export interface ConfiguracionBoletas {
  empresa: Empresa;
  /** Imagen de la firma del empleador (data URL PNG/JPG); null si aún no se ha subido. */
  firmaEmpleador: string | null;
}

export interface ConceptoBoleta {
  concepto: string;
  monto: number;
  /** Cantidad que origina el monto, p. ej. "30.00 DIAS" o "6.00 HORAS". */
  movimiento?: string;
}

/** Detalle de planilla, con los mismos campos que la boleta PDF de la web existente. */
export interface DetalleBoleta {
  situacion: string;
  fechaIngreso: string;
  fechaCese: string;
  tipoTrabajador: string;
  regimenPensionario: string;
  cuspp: string;
  diasLaborados: number;
  diasNoLaborados: number;
  diasSubsidiados: number;
  condicion: string;
  totalHoras: number;
  minutos: number;
  horasSobretiempo: number;
  minutosSobretiempo: number;
  sueldoBasico: number;
  centroCostos: string;
  ocupacion: string;
  otrosEmpleadoresRenta5ta: string;
  periodoPlanilla: string;
  /** 01 Ingresos */
  ingresos: ConceptoBoleta[];
  /** 02 Descuentos */
  descuentos: ConceptoBoleta[];
  /** 03 Aportes del trabajador (se restan del neto) */
  aportesTrabajador: ConceptoBoleta[];
  /** 04 Aportes del empleador (informativos) */
  aportesEmpleador: ConceptoBoleta[];
}

export interface Boleta {
  id: string;
  numero: number;
  dni: string;
  trabajador: string;
  /** Cuenta del colaborador en la plataforma. */
  usuario: string;
  area: string;
  cargo: string;
  detalle: DetalleBoleta;
  firma: EstadoFirma;
  fechaFirma: string | null;
  /** Firma que el colaborador dibujó en la plataforma (PNG, data URL). */
  firmaColaborador?: string | null;
  estadoEnvio: EstadoEnvio;
  fechaEnvio: string | null;
}

export interface ResumenBoletas {
  total: number;
  firmadas: number;
  pendientesFirma: number;
  sinEnviar: number;
}

export type FiltroEstado = 'todas' | 'pendientes_firma' | 'sin_enviar' | 'firmadas';

export const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function nombrePeriodo({ anio, mes }: Pick<Periodo, 'anio' | 'mes'>): string {
  return `${NOMBRES_MESES[mes - 1]} ${anio}`;
}

export function clavePeriodo({ anio, mes }: Pick<Periodo, 'anio' | 'mes'>): string {
  return `${anio}-${String(mes).padStart(2, '0')}`;
}

export function sumar(conceptos: ConceptoBoleta[]): number {
  return conceptos.reduce((total, { monto }) => total + monto, 0);
}

export function totalIngresos({ detalle }: Boleta): number {
  return sumar(detalle.ingresos);
}

/** Descuentos más aportes del trabajador, igual que la boleta PDF. */
export function totalDescuentos({ detalle }: Boleta): number {
  return sumar(detalle.descuentos) + sumar(detalle.aportesTrabajador);
}

export function netoAPagar(boleta: Boleta): number {
  return Math.round((totalIngresos(boleta) - totalDescuentos(boleta)) * 100) / 100;
}

export function calcularResumen(boletas: Boleta[]): ResumenBoletas {
  const firmadas = boletas.filter((b) => b.firma === 'firmada').length;
  return {
    total: boletas.length,
    firmadas,
    pendientesFirma: boletas.length - firmadas,
    sinEnviar: boletas.filter((b) => b.estadoEnvio === 'no_enviado').length,
  };
}

export function cumpleFiltroEstado(boleta: Boleta, filtro: FiltroEstado): boolean {
  switch (filtro) {
    case 'pendientes_firma':
      return boleta.firma === 'pendiente';
    case 'sin_enviar':
      return boleta.estadoEnvio === 'no_enviado';
    case 'firmadas':
      return boleta.firma === 'firmada';
    default:
      return true;
  }
}

export function cumpleBusqueda(boleta: Boleta, texto: string): boolean {
  const consulta = texto.trim().toLowerCase();
  if (!consulta) return true;
  return boleta.trabajador.toLowerCase().includes(consulta) || boleta.dni.includes(consulta);
}

/** Contrato de acceso a datos (patrón repositorio). */
export interface RepositorioBoletas {
  obtenerConfiguracion(): Promise<ConfiguracionBoletas>;
  guardarConfiguracion(configuracion: ConfiguracionBoletas): Promise<void>;
  listarPeriodos(): Promise<Periodo[]>;
  listarBoletas(periodo: Periodo): Promise<Boleta[]>;
  /** Publica las boletas en la cuenta de cada colaborador y devuelve la fecha registrada. */
  enviar(periodo: Periodo, ids: string[]): Promise<string>;
  /** Borra la firma: la boleta vuelve a quedar pendiente y el colaborador debe firmar de nuevo. */
  revertirFirma(periodo: Periodo, id: string): Promise<void>;
  /** Vista del colaborador: solo sus boletas ya enviadas, de todos los periodos (RNF01). */
  listarBoletasDe(dni: string): Promise<BoletaDePeriodo[]>;
  /** El colaborador firma su boleta con la firma que dibujó y devuelve la fecha registrada. */
  firmar(periodo: Periodo, id: string, firmaImagen: string): Promise<string>;
}

export interface BoletaDePeriodo {
  periodo: Periodo;
  boleta: Boleta;
}
