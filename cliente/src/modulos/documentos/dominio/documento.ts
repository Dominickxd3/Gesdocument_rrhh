/**
 * Documentos del trabajador (RF03, RF04, RF06; CUS40–CUS50 y BPMN de gestión de documentos):
 * RR. HH. prepara el documento (desde plantilla o archivo), lo envía a firma;
 * el trabajador lo firma u observa; si lo observa, RR. HH. lo corrige con una nueva versión.
 */
import type { TonoInsignia } from '@/compartido/componentes/Insignia';

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
  { valor: 'contrato', etiqueta: 'Contrato de trabajo' },
  { valor: 'adenda', etiqueta: 'Adenda de contrato' },
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
}

/** El trabajador solo ve los documentos ya enviados (CUS45: documentos propios habilitados). */
export const habilitadoParaTrabajador = (d: Documento) => d.estado !== 'preparacion';

export const ultimoEvento = (d: Documento, accion: EventoDocumento['accion']) => [...d.historial].reverse().find((h) => h.accion === accion);
