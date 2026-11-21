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
  /** Domicilio real, como figura en contratos y adendas. */
  domicilio: string;
  /** Contrato vigente: lo usan las plantillas (adenda, constancia…). */
  contrato: ContratoVigente;
}

/** Modalidades que aparecen en los contratos de la empresa. */
export type ModalidadContrato = 'incremento_actividad' | 'plazo_fijo' | 'indeterminado';

export const TEXTO_MODALIDAD: Record<ModalidadContrato, string> = {
  incremento_actividad: 'Contrato de Trabajo a plazo Fijo bajo la modalidad de Incremento de Actividad',
  plazo_fijo: 'Contrato de Trabajo a plazo Fijo',
  indeterminado: 'Contrato de Trabajo a Plazo Indeterminado',
};

export interface ContratoVigente {
  modalidad: ModalidadContrato;
  /** Fecha en que se suscribió el contrato (AAAA-MM-DD). */
  fecha: string;
  /** Cargo que figura en el contrato (cláusula segunda). */
  cargo: string;
  remuneracion: number;
  /** Cláusula del contrato donde se pactó la remuneración. */
  clausulaRemuneracion: 'tercera' | 'cuarta' | 'sexta';
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
