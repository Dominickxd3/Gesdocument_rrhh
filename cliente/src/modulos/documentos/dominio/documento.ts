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

export type TipoDocumento = 'contrato' | 'adenda' | 'constancia' | 'reglamento' | 'epp' | 'domicilio';

export const TIPOS_DOCUMENTO: { valor: TipoDocumento; etiqueta: string }[] = [
  { valor: 'contrato', etiqueta: 'Contrato por incremento de actividad' },
  { valor: 'adenda', etiqueta: 'Adenda al contrato de trabajo' },
  { valor: 'constancia', etiqueta: 'Constancia de trabajo' },
  { valor: 'reglamento', etiqueta: 'Cargo de Reglamento Interno' },
  { valor: 'epp', etiqueta: 'Cargo de entrega de EPP' },
  { valor: 'domicilio', etiqueta: 'Declaración jurada de domicilio' },
];

export const etiquetaTipo = (t: TipoDocumento) => TIPOS_DOCUMENTO.find((x) => x.valor === t)?.etiqueta ?? t;

export interface EventoDocumento {
  accion: 'creado' | 'enviado' | 'observado' | 'corregido' | 'firmado';
  usuario: string;
  fecha: string;
  nota?: string;
  /** Firma dibujada por el trabajador (PNG en data URL); solo en el evento "firmado". */
  firmaImagen?: string;
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
