/**
 * Incidencias y memorándums (CUS29–CUS39 y BPMN de memorándums):
 * se registra la incidencia con evidencias, RR. HH. investiga y registra actuaciones;
 * se cierra sin memorándum o se emite uno desde plantilla, que el trabajador firma como recibido.
 */
import type { TonoInsignia } from '@/compartido/componentes/Insignia';

export type EstadoIncidencia = 'registrada' | 'en_investigacion' | 'cerrada' | 'memo_emitido' | 'memo_firmado';

export const ESTADOS_INCIDENCIA: { valor: EstadoIncidencia; etiqueta: string; tono: TonoInsignia }[] = [
  { valor: 'registrada', etiqueta: 'Registrada', tono: 'gris' },
  { valor: 'en_investigacion', etiqueta: 'En investigación', tono: 'ambar' },
  { valor: 'cerrada', etiqueta: 'Cerrada sin memorándum', tono: 'verde' },
  { valor: 'memo_emitido', etiqueta: 'Memorándum por firmar', tono: 'azul' },
  { valor: 'memo_firmado', etiqueta: 'Memorándum firmado', tono: 'verde' },
];

export const infoEstado = (e: EstadoIncidencia) => ESTADOS_INCIDENCIA.find((x) => x.valor === e)!;

export const MEDIDAS = ['Llamada de atención escrita', 'Amonestación', 'Suspensión sin goce de haber (1 día)'];

export interface Actuacion {
  tipo: 'registro' | 'explicacion' | 'actuacion' | 'conclusion' | 'cierre' | 'memo' | 'recepcion' | 'firma';
  usuario: string;
  fecha: string;
  texto?: string;
  /** Firma dibujada por el trabajador al recibir el memorándum (PNG, data URL). */
  firmaImagen?: string;
}

export interface Memorandum {
  medida: string;
  texto: string;
  emitido: string;
}

export interface Incidencia {
  id: string;
  numero: number;
  dni: string;
  trabajador: string;
  fecha: string;
  asunto: string;
  descripcion: string;
  reportadoPor: string;
  evidencias: string[];
  estado: EstadoIncidencia;
  memorandum: Memorandum | null;
  actuaciones: Actuacion[];
}

export const TEXTO_ACTUACION: Record<Actuacion['tipo'], { texto: string; icono: string }> = {
  registro: { texto: 'registró la incidencia', icono: 'pi pi-flag' },
  explicacion: { texto: 'registró la explicación del trabajador', icono: 'pi pi-comment' },
  actuacion: { texto: 'registró una actuación', icono: 'pi pi-file-edit' },
  conclusion: { texto: 'registró la conclusión', icono: 'pi pi-check-square' },
  cierre: { texto: 'cerró la incidencia sin memorándum', icono: 'pi pi-lock' },
  memo: { texto: 'emitió el memorándum', icono: 'pi pi-send' },
  recepcion: { texto: 'confirmó la recepción', icono: 'pi pi-inbox' },
  firma: { texto: 'firmó la recepción del memorándum', icono: 'pi pi-pencil' },
};

/** El trabajador solo ve memorándums ya emitidos (CUS36–CUS39). */
export const visibleParaTrabajador = (i: Incidencia) => i.estado === 'memo_emitido' || i.estado === 'memo_firmado';

export function textoMemorandum(trabajador: string, dni: string, asunto: string, fecha: string, medida: string) {
  return `Por medio del presente se le comunica que, tras la revisión de los hechos ocurridos el ${fecha} referidos a "${asunto}", y habiéndose evaluado sus descargos, se ha determinado aplicar la siguiente medida: ${medida}.\n\nSe le exhorta a cumplir con las normas del Reglamento Interno de Trabajo. La reiteración de esta conducta podrá dar lugar a medidas de mayor gravedad.\n\nTrabajador: ${trabajador} · DNI ${dni}`;
}
