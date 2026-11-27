/**
 * Documentos del trabajador (RF03, RF04, RF06; CUS40–CUS50 y BPMN de gestión de documentos):
 * RR. HH. prepara el documento (desde plantilla o archivo), lo envía a firma;
 * el trabajador lo firma u observa; si lo observa, RR. HH. lo corrige con una nueva versión.
 */
import type { TonoInsignia } from '@/compartido/componentes/Insignia';
import type { DatosAdenda } from './plantillaAdenda';
import type { DatosContrato } from './plantillaContrato';

export type EstadoDocumento = 'preparacion' | 'pendiente_firma' | 'observado' | 'firmado';

export const ESTADOS_DOCUMENTO: { valor: EstadoDocumento; etiqueta: string; tono: TonoInsignia }[] = [
  { valor: 'preparacion', etiqueta: 'En preparación', tono: 'gris' },
  { valor: 'pendiente_firma', etiqueta: 'Pendiente de firma', tono: 'ambar' },
  { valor: 'observado', etiqueta: 'Observado', tono: 'azul' },
  { valor: 'firmado', etiqueta: 'Firmado', tono: 'verde' },
];

export const infoEstado = (e: EstadoDocumento) => ESTADOS_DOCUMENTO.find((x) => x.valor === e)!;

/** Documentos que Gestión Humana entrega a todo trabajador al ingresar (expediente de ingreso). */
export type TipoIngreso = 'induccion' | 'confidencialidad' | 'etica' | 'celulares' | 'vestimenta' | 'antecedentes' | 'croquis';

export type TipoDocumento = 'contrato' | 'adenda' | 'constancia' | 'reglamento' | 'domicilio' | TipoIngreso;

/** Orden en que se entregan y se muestran los documentos de ingreso. */
export const TIPOS_INGRESO: TipoIngreso[] = ['induccion', 'confidencialidad', 'etica', 'celulares', 'vestimenta', 'antecedentes', 'croquis'];

export const esDeIngreso = (t: TipoDocumento): t is TipoIngreso => (TIPOS_INGRESO as TipoDocumento[]).includes(t);

export const TIPOS_DOCUMENTO: { valor: TipoDocumento; etiqueta: string }[] = [
  { valor: 'contrato', etiqueta: 'Contrato de trabajo' },
  { valor: 'adenda', etiqueta: 'Adenda al contrato de trabajo' },
  { valor: 'induccion', etiqueta: 'Inducción al personal nuevo' },
  { valor: 'confidencialidad', etiqueta: 'Acuerdo de confidencialidad' },
  { valor: 'etica', etiqueta: 'Código de Ética' },
  { valor: 'celulares', etiqueta: 'Política de uso de celulares' },
  { valor: 'vestimenta', etiqueta: 'Política de vestimenta y aseo' },
  { valor: 'antecedentes', etiqueta: 'DJ de no tener antecedentes policiales' },
  { valor: 'croquis', etiqueta: 'Croquis de domicilio' },
  { valor: 'constancia', etiqueta: 'Constancia de trabajo' },
  { valor: 'reglamento', etiqueta: 'Cargo de Reglamento Interno' },
  { valor: 'domicilio', etiqueta: 'Declaración jurada de domicilio' },
];

export const etiquetaTipo = (t: TipoDocumento) => TIPOS_DOCUMENTO.find((x) => x.valor === t)?.etiqueta ?? t;

/**
 * Expediente digital (RF03, RF04; CUS40): cómo se agrupan los documentos de cada trabajador
 * y cuáles son obligatorios. Para cambiar el expediente basta con editar estas dos listas.
 */
export const CATEGORIAS_EXPEDIENTE: { id: string; titulo: string; icono: string; tipos: TipoDocumento[] }[] = [
  { id: 'ingreso', titulo: 'Ingreso a la empresa', icono: 'pi pi-sign-in', tipos: TIPOS_INGRESO },
  { id: 'contratacion', titulo: 'Contratación', icono: 'pi pi-file-edit', tipos: ['contrato', 'adenda'] },
  { id: 'normas', titulo: 'Normas y seguridad', icono: 'pi pi-shield', tipos: ['reglamento'] },
  { id: 'personales', titulo: 'Datos personales', icono: 'pi pi-id-card', tipos: ['domicilio'] },
  { id: 'constancias', titulo: 'Constancias', icono: 'pi pi-verified', tipos: ['constancia'] },
];

/** Documentos que todo expediente debe tener firmados; los demás se generan cuando se necesitan. */
export const TIPOS_REQUERIDOS: TipoDocumento[] = [...TIPOS_INGRESO, 'contrato', 'reglamento', 'domicilio'];

export type SituacionRequisito = 'firmado' | 'en_curso' | 'falta';

/** Situación de cada documento requerido según la última versión que tenga el trabajador. */
export function situacionRequisito(documentos: Documento[], tipo: TipoDocumento): { situacion: SituacionRequisito; documento?: Documento } {
  const delTipo = documentos.filter((d) => d.tipo === tipo).sort((a, b) => b.numero - a.numero);
  const firmado = delTipo.find((d) => d.estado === 'firmado');
  if (firmado) return { situacion: 'firmado', documento: firmado };
  if (delTipo[0]) return { situacion: 'en_curso', documento: delTipo[0] };
  return { situacion: 'falta' };
}

export interface ResumenExpediente {
  requeridosCompletos: number;
  requeridosTotal: number;
  /** Todos los documentos enviados al trabajador (requeridos y adicionales) que ya firmó. */
  firmados: number;
  /** Documentos enviados al trabajador más los requeridos que aún no se le preparan. */
  totalAFirmar: number;
  pendientesFirma: number;
  observados: number;
  total: number;
  ultimaActualizacion: string | null;
}

export function resumirExpediente(documentos: Documento[]): ResumenExpediente {
  const fechas = documentos.map((d) => d.historial[d.historial.length - 1].fecha).sort();
  return {
    requeridosCompletos: TIPOS_REQUERIDOS.filter((t) => situacionRequisito(documentos, t).situacion === 'firmado').length,
    requeridosTotal: TIPOS_REQUERIDOS.length,
    firmados: documentos.filter((d) => d.estado === 'firmado').length,
    totalAFirmar:
      documentos.filter((d) => d.estado !== 'preparacion').length +
      TIPOS_REQUERIDOS.filter((t) => situacionRequisito(documentos, t).situacion === 'falta').length,
    pendientesFirma: documentos.filter((d) => d.estado === 'pendiente_firma').length,
    observados: documentos.filter((d) => d.estado === 'observado').length,
    total: documentos.length,
    ultimaActualizacion: fechas[fechas.length - 1] ?? null,
  };
}

export interface EventoDocumento {
  accion: 'creado' | 'enviado' | 'observado' | 'corregido' | 'firmado';
  usuario: string;
  fecha: string;
  nota?: string;
  /** Firma dibujada por el trabajador (PNG en data URL); solo en el evento "firmado". */
  firmaImagen?: string;
  /** Croquis de domicilio dibujado por el trabajador al firmar (PNG, data URL). */
  croquisImagen?: string;
  /** Referencias del domicilio que escribió el trabajador en el croquis. */
  croquisReferencias?: string;
}

/** Lo que el trabajador completa en el croquis antes de firmarlo. */
export interface CroquisFirmado {
  imagen: string;
  referencias: string;
}

export interface Documento {
  id: string;
  numero: number;
  dni: string;
  trabajador: string;
  tipo: TipoDocumento;
  version: number;
  /** Generado desde plantilla o archivo subido (nombre del archivo). */
  origen: { tipo: 'plantilla' } | { tipo: 'archivo'; nombre: string };
  estado: EstadoDocumento;
  historial: EventoDocumento[];
  /** Solo en adendas generadas desde plantilla: lo que cambia y la copia de los datos del trabajador. */
  adenda?: DatosAdenda;
  /** Solo en contratos generados desde plantilla. */
  contrato?: DatosContrato;
}

/** El trabajador solo ve los documentos ya enviados (CUS45: documentos propios habilitados). */
export const habilitadoParaTrabajador = (d: Documento) => d.estado !== 'preparacion';

export const ultimoEvento = (d: Documento, accion: EventoDocumento['accion']) => [...d.historial].reverse().find((h) => h.accion === accion);
