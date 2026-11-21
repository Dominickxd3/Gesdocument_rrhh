/**
 * Plantilla "Adenda al Contrato de Trabajo", tomada del modelo de Gestión Humana.
 * El texto se arma con los datos del trabajador y de su contrato vigente; las cláusulas
 * se numeran solas según lo que cambie (cargo, remuneración) y las cláusulas especiales elegidas.
 */
import { fechaEnTexto, fechaFirmaEnTexto, montoSoles } from '@/compartido/formato/montos';
import { TEXTO_MODALIDAD, type ContratoVigente, type ModalidadContrato } from '@/modulos/trabajadores/dominio/trabajador';
import type { DatosContrato } from './plantillaContrato';

/** Datos de la empresa y del representante legal, como figuran en el modelo de adenda de Gestión Humana. */
export const EMPLEADOR = {
  razonSocial: 'GRUPO PECUARIO SAC',
  ruc: '20513967234',
  domicilio: 'Av. Canto Bello N° 177 Urb. Canto Bello, distrito de San Juan de Lurigancho, ciudad de Lima',
  // Nombre y DNI del representante: se leen de cliente/.env.local (no se suben al repositorio).
  representante: import.meta.env.VITE_REPRESENTANTE_LEGAL ?? 'Nombre del Representante Legal',
  dniRepresentante: import.meta.env.VITE_DNI_REPRESENTANTE_LEGAL ?? '00000000',
  cargoRepresentante: 'Gerente General y Representante Legal',
  partida: 'Ficha N° 11915363',
  ciiu: '4630',
};

export type ClausulaEspecial = 'cobranzas' | 'ventas' | 'jornada_rotativa';

export const CLAUSULAS_ESPECIALES: { valor: ClausulaEspecial; etiqueta: string; ayuda: string }[] = [
  { valor: 'cobranzas', etiqueta: 'Responsabilidad de cobranzas', ayuda: 'Depósito el mismo día (RIT art. 92 inc. rr) y custodia del dinero' },
  { valor: 'ventas', etiqueta: 'Obligaciones de ventas', ayuda: 'Atención de clientes, equipo móvil, créditos y comprobantes' },
  { valor: 'jornada_rotativa', etiqueta: 'Jornada rotativa', ayuda: '48 horas semanales, turno diurno y nocturno' },
];

/** Sugerencia según el cargo nuevo: cobranzas → cobranzas; vendedor → ventas. */
export function clausulasSugeridas(cargoNuevo: string): ClausulaEspecial[] {
  const c = cargoNuevo.toUpperCase();
  const lista: ClausulaEspecial[] = [];
  if (c.includes('COBRANZA')) lista.push('cobranzas');
  if (c.includes('VENDEDOR') || c.includes('VENTA')) lista.push('ventas');
  return lista;
}

/**
 * Motivo de la adenda (modelos de Gestión Humana):
 * - cambio: cambio de cargo y/o remuneración.
 * - obligaciones_vendedor: obligaciones del vendedor (se firma junto con su contrato o aparte).
 */
export type MotivoAdenda = 'cambio' | 'obligaciones_vendedor';

export const MOTIVOS_ADENDA: { valor: MotivoAdenda; etiqueta: string }[] = [
  { valor: 'cambio', etiqueta: 'Cambio de cargo o remuneración' },
  { valor: 'obligaciones_vendedor', etiqueta: 'Obligaciones del vendedor' },
];

/** Cargos de ventas: su contrato lleva la adenda de obligaciones como página adicional. */
export const esCargoVentas = (cargo: string) => /VENDEDOR|VENTA/i.test(cargo);

/** Lo que RR. HH. completa al generar la adenda; lo demás sale de la ficha. */
export interface DatosAdenda {
  /** Si falta, es "cambio" (adendas generadas antes de existir los motivos). */
  motivo?: MotivoAdenda;
  cargoNuevo: string;
  /** null = la remuneración no cambia (no se incluye esa cláusula). */
  remuneracionNueva: number | null;
  especiales: ClausulaEspecial[];
  fechaFirma: string;
  /** Copia del trabajador y su contrato al momento de generar (el documento no cambia si luego cambia la ficha). */
  trabajador: { nombre: string; dni: string; domicilio: string };
  contrato: ContratoVigente;
}

export interface Clausula {
  texto: string;
  items?: string[];
}

const ORDINALES = ['PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA', 'SEXTA', 'SÉPTIMA', 'OCTAVA', 'NOVENA', 'DÉCIMA'];

const CLAUSULAS: Record<ClausulaEspecial, Clausula[]> = {
  cobranzas: [
    {
      texto:
        'EL TRABAJADOR asumirá lo dispuesto en el Reglamento Interno de Trabajo en su artículo 92°, que en su inciso rr) dice que son obligaciones de los colaboradores, realizar el depósito de la cobranza, en las cuentas bancarias proporcionadas por la empresa, el mismo día de ser efectuada esta. Asimismo, el Decreto Legislativo N° 728 en su artículo 25° establece que, las faltas graves que dan motivo al término de la relación laboral cuyo inciso c) menciona la apropiación consumada o frustrada de bienes o servicios del empleador o que se encuentran bajo su custodia, así como la retención o utilización indebidas de los mismos, en beneficio propio o de terceros, con prescindencia de su valor, bajo responsabilidad de las consecuencias civiles y penales.',
    },
    {
      texto:
        'Es responsabilidad del trabajador(a) la custodia del dinero y/o título valor materia de la cobranza realizada o recepcionada durante el ejercicio de su labor hasta el depósito correspondiente en las cuentas corrientes de Grupo Pecuario SAC, por lo que cualquier pérdida de los mismos deberá ser asumida y cancelada en el plazo que el empleador otorgue, siendo este convenio un mutuo acuerdo entre empleador y trabajador.',
    },
  ],
  ventas: [
    {
      texto: 'EL TRABAJADOR se obliga de manera específica a lo siguiente:',
      items: [
        'Atender eficazmente a los clientes, realizar el correcto registro de sus pedidos en el sistema de la empresa, entregar de forma oportuna los productos (ventas), gestionar la cobranza de todos sus pedidos y efectuar el depósito en las cuentas bancarias proporcionadas por la empresa, el mismo día de ser efectuada la misma.',
        'Toda transacción y/o comunicación comercial, laboral u otra índole con los clientes y/o proveedores, debe ser efectuada exclusivamente a través del equipo móvil que fue otorgado por la empresa, queda totalmente prohibido eliminar u omitir información del equipo celular sin previa autorización de su jefe directo y hacer uso de sus teléfonos personales para fines comerciales de la empresa y viceversa hacer uso de los equipos de la empresa para fines personales.',
        'Es una de sus funciones principales la captación de nuevos clientes por los medios necesarios y prudentes (Redes sociales, visita a los mercados de abastos, horeca, etc.)',
        'Asumir la responsabilidad del valor de la mercadería que indica en su orden de pedido.',
        'Respetar los límites establecidos respecto a la línea de crédito asignado por el área de finanzas, caso contrario EL TRABAJADOR asumirá la responsabilidad del valor del crédito excedente que otorga a los clientes.',
        'No alterar y/o sobrevalorar los precios de la mercadería que fueron fijados por la empresa.',
        'Entregar todos los comprobantes de ventas y de cobranzas a los clientes, y sustentar con documentos fotográficos o fílmicos de ser requerido por sus superiores.',
        'No adulterar ningún comprobante de cobranza (montos, nombres de clientes, etc.), ni los registros de pedidos del sistema, después de haber salido la mercadería, sin previa autorización de EL EMPLEADOR.',
      ],
    },
  ],
  jornada_rotativa: [
    {
      texto:
        'Se deja expresa constancia que la jornada de trabajo a la que estará sujeto EL TRABAJADOR, será de 48 horas semanales y de manera rotativa, considerando turno diurno y nocturno, con una hora de refrigerio.',
    },
  ],
};

/** Cláusulas del modelo "ADENDA CONTRATO TRABAJO (VENDEDORES)". */
const OBLIGACIONES_VENDEDOR: Clausula[] = [
  {
    texto:
      'EL TRABAJADOR, declara expresamente que ha sido informado del carácter temporal y la naturaleza de la labor a desarrollar en la empresa. Asimismo, se obliga a cumplir y/o acatar las normas y directivas en el Centro de Trabajo, obligándose a:',
    items: [
      'Cumplir con todas las órdenes y directivas relacionadas con su trabajo, que impartan sus jefes y/o superior jerárquico.',
      'Desempeñar su labor con toda eficiencia, lealtad, proactividad y diligencia.',
      'Trabajar en armonía y solidaridad con el resto de sus compañeros.',
      'Ser revisado por el personal de vigilancia al ingreso y salida del centro laboral.',
      'Asumir la responsabilidad del valor de la mercadería que indica en su orden de pedido.',
      'Asumir la responsabilidad del valor de los créditos que otorga a los clientes.',
      'Realizar el depósito de la cobranza, en las cuentas bancarias proporcionadas por la empresa, el mismo día de ser efectuada esta (según el inciso rr del artículo 92° del RIT).',
      'No alterar y/o sobrevalorar los precios de la mercadería que fueron fijados por la empresa.',
      'Entregar todos los comprobantes de ventas y de cobranzas a los clientes, y sustentar con documentos fotográficos o fílmicos de ser requerido por sus superiores.',
      'No adulterar ningún comprobante de cobranza (montos, nombres de clientes, etc.), ni los registros de pedidos del sistema, después de haber salido la mercadería, sin previa autorización de EL EMPLEADOR.',
      'EL TRABAJADOR no prestará servicios directo o indirectamente a otras empresas, ni podrá trabajar por cuenta propia en el mismo rubro, durante la vigencia de este contrato.',
      'No hacer uso de las mercancías, dinero y en general de todos los bienes de EL EMPLEADOR, sin la expresa y escrita autorización de éste o de los representantes legales de la empresa.',
      'Brindar las facilidades al Supervisor Comercial en el trabajo de campo, cuando este requiera verificar el estado de cuenta de los clientes.',
      'Las demás normas legales y administrativas vigentes.',
    ],
  },
  {
    texto:
      'EL TRABAJADOR asumirá lo dispuesto en el Reglamento Interno de Trabajo en su artículo 92°, que en su inciso rr) dice que “son obligaciones de los colaboradores, realizar el depósito de la cobranza, en las cuentas bancarias proporcionadas por la empresa, el mismo día de ser efectuada esta”. Asimismo el Decreto Legislativo N° 728 en su artículo 25° establece que las faltas graves que dan motivo al término de la relación laboral cuyo inciso d) menciona “la apropiación consumada o frustrada de bienes o servicios del empleador o que se encuentran bajo su custodia, así como la retención o utilización indebidas de los mismos, en beneficio propio o de terceros, con prescindencia de su valor”, bajo responsabilidad de las consecuencias civiles y penales.',
  },
];

export interface AdendaArmada {
  introduccion: string;
  antecedentes: { titulo: string; texto: string }[];
  clausulas: (Clausula & { ordinal: string })[];
  cierre: string;
}

const modalidadTexto = (m: ModalidadContrato) => TEXTO_MODALIDAD[m];

/** Arma el texto completo de la adenda para un trabajador. */
export function armarAdenda(d: DatosAdenda): AdendaArmada {
  const contratoTexto = modalidadTexto(d.contrato.modalidad);
  const lista: Clausula[] = [];
  if (d.motivo === 'obligaciones_vendedor') {
    lista.push(...OBLIGACIONES_VENDEDOR);
  } else {
    lista.push({ texto: `Que las partes acuerdan que por la presente adenda el cargo que desempeñara EL TRABAJADOR será de ${d.cargoNuevo.toUpperCase()}, con sus deberes y obligaciones que demande su cargo.` });
    if (d.remuneracionNueva !== null) {
      lista.push({
        texto: `EL TRABAJADOR percibirá una remuneración mensual de ${montoSoles(d.remuneracionNueva)} en donde se le deducirían las aportaciones y descuentos por tributos establecido en la ley.`,
      });
    }
    for (const especial of CLAUSULAS_ESPECIALES) if (d.especiales.includes(especial.valor)) lista.push(...CLAUSULAS[especial.valor]);
  }
  lista.push(
    { texto: `Que es voluntad de las partes celebrar la presente adenda y anexarlo al ${contratoTexto} antes mencionado para que forme parte integral del mismo.` },
    {
      texto:
        'Para todos los efectos legales las partes constituyen domicilio real en los lugares indicados en el encabezamiento de la presente adenda, donde serán válidas todas las notificaciones, sean estas judiciales o extrajudiciales, permaneciendo estos domicilios plenamente vigentes para todos los efectos, en tanto no comunique nuevo domicilio.',
    },
    { texto: `EL TRABAJADOR y EL EMPLEADOR ratifican su conformidad respecto del íntegro de las demás cláusulas pactadas en el ${contratoTexto}, que dio origen a la presente adenda y que no sufren modificación alguna.` },
  );

  const e = EMPLEADOR;
  return {
    introduccion: `Conste por el presente documento una adenda al ${contratoTexto}, que celebran al amparo del Art. 58° Ley de Productividad y Competitividad Laboral aprobado por D.S. N° 003-97-TR, de una parte ${e.razonSocial}, con RUC N° ${e.ruc}, con domicilio fiscal en ${e.domicilio}, representada en este acto por el Sr. ${e.representante}, con DNI N° ${e.dniRepresentante}, en su carácter de ${e.cargoRepresentante}, con Poder debidamente inscrito en la ${e.partida} del registro de personas Jurídicas de Lima, CIIU ${e.ciiu}, denominada en adelante EL EMPLEADOR, por una parte, y don(ña) ${d.trabajador.nombre.replace(',', '')} con DNI Nº ${d.trabajador.dni}, domiciliado(a) en ${d.trabajador.domicilio}, en adelante denominado EL TRABAJADOR, por la otra, en los términos y condiciones siguientes:`,
    antecedentes: [
      {
        titulo: 'OBJETIVOS',
        texto: `Con fecha ${fechaEnTexto(d.contrato.fecha)}, EL TRABAJADOR y EL EMPLEADOR suscribieron un contrato de trabajo, en su cláusula segunda menciona que desempeñará el cargo de ${d.contrato.cargo}.`,
      },
      {
        titulo: 'REMUNERACIÓN',
        texto: `En su cláusula ${d.contrato.clausulaRemuneracion} se acordó que EL TRABAJADOR percibiría una remuneración mensual de ${montoSoles(d.contrato.remuneracion)} en donde se le deducirían las aportaciones y descuentos por tributos establecido en la ley.`,
      },
    ],
    // El modelo de vendedores numera "PRIMERA.-"; el de cambio de cargo, "PRIMERA:".
    clausulas: lista.map((c, i) => ({ ...c, ordinal: `${ORDINALES[i] ?? `${i + 1}°`}${d.motivo === 'obligaciones_vendedor' ? '.-' : ':'}` })),
    cierre: `En prueba de su conformidad las partes firman dos (2) ejemplares de la presente adenda, en la ciudad de Lima, ${fechaFirmaEnTexto(d.fechaFirma)}.`,
  };
}

/**
 * Adenda de obligaciones del vendedor que acompaña a su contrato nuevo (página adicional para firmar).
 * Toma los datos del propio contrato: modalidad por incremento de actividad, remuneración en la cláusula tercera.
 */
export function adendaVendedorDeContrato(c: DatosContrato): DatosAdenda {
  return {
    motivo: 'obligaciones_vendedor',
    cargoNuevo: c.cargo,
    remuneracionNueva: null,
    especiales: [],
    fechaFirma: c.desde,
    trabajador: { ...c.trabajador },
    contrato: { modalidad: 'incremento_actividad', fecha: c.desde, cargo: c.cargo.toUpperCase(), remuneracion: c.remuneracion, clausulaRemuneracion: 'tercera' },
  };
}
