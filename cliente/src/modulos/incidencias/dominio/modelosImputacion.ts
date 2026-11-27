/**
 * Modelos de "Carta de imputación de cargos" de Gestión Humana (los memorándums de la empresa).
 * Un modelo por tipo de falta, sin repetir: el texto legal (base y artículos del Reglamento Interno)
 * es fijo; los hechos se completan con la incidencia y RR. HH. puede ajustarlos antes de emitir.
 *
 * En `fundamento` y `hechos`: **negrita**, __subrayado__ (como en las cartas originales).
 * Marcadores que se reemplazan: [fecha] (día de los hechos).
 */

export type IdModelo =
  | 'tardanza'
  | 'tardanza_reiterada'
  | 'falta_injustificada'
  | 'abandono'
  | 'charla'
  | 'funciones'
  | 'cobranza'
  | 'bpm'
  | 'confidencialidad'
  | 'mala_fe'
  | 'convivencia'
  | 'alcohol'
  | 'epp'
  | 'equipos_no_asignados'
  | 'insalubres'
  | 'celular_proceso'
  | 'celular_trabajo'
  | 'bienes'
  | 'danos'
  | 'permisos'
  | 'operaciones';

export interface ModeloImputacion {
  id: IdModelo;
  /** Nombre corto para listas y plantillas. */
  nombre: string;
  /** Texto de la línea "Asunto:" de la carta. */
  asunto: string;
  /** Primer párrafo: potestad de asignar horario o de calificar faltas. */
  base: 'horario' | 'faltas';
  /** Fundamento del Reglamento Interno (párrafo "Así, según nuestro reglamento…"). */
  fundamento: string;
  /** Hechos de ejemplo; se ajustan en cada incidencia. */
  hechos: string;
  /** Plazo de descargos en días calendario. */
  plazo: number;
}

const ART_92_BCK =
  'en su **Art. 92°** Son obligaciones de los colaboradores **en su inciso b)** __(Prestar sus servicios con buena fe, poniendo el máximo de su habilidad y eficiencia en el desempeño de sus labores)__, **en su inciso c)** __(Conocer las características de sus labores, relacionadas cargo que ocupa y cumplir con honradez, lealtad y eficiencia las funciones y responsabilidades asignadas)__, **en su inciso k)** __(Desempeñar sus funciones con responsabilidad, eficiencia y eficacia)__';

const OBLIGACIONES =
  'Así, según nuestro reglamento interno de trabajo se les manifiesta a todos los trabajadores la obligación de cumplir con las obligaciones y deberes, lo cual es un elemento esencial para la realización correcta, efectiva de las labores asignadas y mantener el buen clima laboral y ';

const HORARIO =
  'Así, según nuestro reglamento interno de trabajo se les asigna a todos los trabajadores la obligación de cumplir con el horario de trabajo, lo cual es un elemento esencial para la realización correcta y efectiva de las labores asignadas';

const ART_59 =
  ', en su **Art. 59°** __“Si el colaborador no se comunica con la empresa o no presenta justificación dentro del plazo señalado, su inasistencia será considerada como una falta injustificada y en consecuencia, se le aplicará un descuento y la sanción que corresponda”__.';

const ART_94_X =
  'en su **Art. 94°** queda expresamente prohibido a los colaboradores **en su inciso x)** __“Presentarse a sus labores en estado de embriaguez o bajo los efectos de bebidas alcohólicas, sustancias tóxicas, drogas o estupefacientes.”__, en el **Art. 92°** son obligaciones de los colaboradores **en su inciso b)** __(Prestar sus servicios con buena fe, poniendo el máximo de su habilidad y eficiencia en el desempeño de sus labores)__, **en su inciso c)** __(Conocer las características de sus labores, relacionadas cargo que ocupa y cumplir con honradez, lealtad y eficiencia las funciones y responsabilidades asignadas)__.';

const ART_4_39 =
  'en su **Capítulo I Art. 4°** __“Es política básica de Grupo Pecuario S.A.C., exigir una conducta de respeto mutuo, basado en la buena fe y cortesía entre sus colaboradores”__, **Capítulo VII Art. 39°** __“La empresa promueve el respeto mutuo y cordialidad entre todos los colaboradores, sin soslayar los principios de autoridad, orden y disciplina”__.';

const ART_94_AA =
  'en su **Art. 94°** queda expresamente prohibido a los colaboradores **en su inciso aa)** __“crear o fomentar condiciones insalubres dentro de las instalaciones de la empresa, que puedan poner en peligro la vida o salud de sus compañeros o afectar los intereses de Grupo Pecuario S.A.C.”__';

const HORARIO_PUNTUAL =
  'en su **Art. 92° inciso p)** __(Cumplir con los horarios puntuales, turnos y ciclos de trabajo, establecidos por Grupo Pecuario S.A.C.)__ e **inciso cc)** __(Estar en su puesto de trabajo a la hora señalada)__, en el **Art. 94°** queda expresamente prohibido a los colaboradores __“faltar al trabajo o abandonarlo en horas de labor, sin causa que lo justifique o sin permiso de Grupo Pecuario S.A.C.”__';

export const MODELOS_IMPUTACION: ModeloImputacion[] = [
  {
    id: 'tardanza',
    nombre: 'Tardanza',
    asunto: 'Carta de imputación por tardanza',
    base: 'horario',
    fundamento: `${HORARIO}.`,
    hechos:
      'Según se constata en el registro de asistencia ha incurrido en una falta al asistir al centro de trabajo fuera del horario de ingreso establecido el día **[fecha]**, registrando su ingreso a las **8:05 a.m.**, siendo su horario de ingreso a las 8:00 a.m., sin presentar justificación ni previo aviso a su jefe directo.',
    plazo: 6,
  },
  {
    id: 'tardanza_reiterada',
    nombre: 'Tardanza reiterada',
    asunto: 'Carta de imputación por tardanza reiterativa',
    base: 'horario',
    fundamento: `${HORARIO}, en su **Art. 29°** __(El colaborador que llegue tarde al centro de labores, deberá solicitar autorización al superior jerárquico para que, en coordinación con el Área de Gestión Humana, se evalúe la autorización de su ingreso o no, a las instalaciones de la empresa. El colaborador que tenga la costumbre de llegar tarde, no podrá acogerse a este artículo y se le aplicará la sanción que corresponda, por cometer esta falta. Las tardanzas reiteradas al centro de labores, será considerado como falta grave, por evidenciar un desacato directo del colaborador, respecto de lo establecido en este reglamento)__.`,
    hechos:
      'Según se constata en el registro de asistencia usted llegó tarde a su centro de labores en reiteradas ocasiones, siendo la última el día **[fecha]**, sin comunicar ni solicitar autorización previa a su jefatura inmediata para dichas tardanzas. Por lo tanto, a nombre de la empresa se procede a presentar una imputación de cargos.',
    plazo: 6,
  },
  {
    id: 'falta_injustificada',
    nombre: 'Falta injustificada',
    asunto: 'Carta de imputación por falta injustificada',
    base: 'horario',
    fundamento: `${HORARIO}${ART_59}`,
    hechos:
      'Según se constata en el registro de asistencia usted faltó el día **[fecha]**, sin presentar justificación alguna ni contar con la autorización de su jefe inmediato. Por lo tanto, a nombre de la empresa se procede a presentar una imputación de cargos.',
    plazo: 6,
  },
  {
    id: 'abandono',
    nombre: 'Retiro antes del horario',
    asunto: 'Carta de imputación Incumplimiento obligaciones',
    base: 'faltas',
    fundamento: `${OBLIGACIONES}${HORARIO_PUNTUAL}.`,
    hechos:
      'Según se constata que Ud. cometió una falta, al haberse retirado de la empresa antes de su horario de trabajo el día **[fecha]**, sin ningún permiso y/o autorización de su jefe inmediato. Por lo tanto, a nombre de la empresa se procede a presentar una imputación de cargos.',
    plazo: 6,
  },
  {
    id: 'permisos',
    nombre: 'Ingreso fuera de lo autorizado',
    asunto: 'Carta de imputación por incumplimiento del permiso otorgado',
    base: 'faltas',
    fundamento: `${OBLIGACIONES}${HORARIO_PUNTUAL}, en el **Art. 57°** __(El otorgamiento de permisos y/o licencias por motivos particulares, es facultad exclusiva de Grupo Pecuario S.A.C. su autorización estará sujeta a las necesidades propias del trabajo y las características específicas de las circunstancias que las originen)__, en el **Art. 56°** __(Los permisos y/o licencias, deberán ser solicitados y concedidos, para atender situaciones de emergencia impostergables)__.`,
    hechos:
      'Se ha verificado que el día **[fecha]** usted solicitó a su jefe directo permiso para ingresar con una hora de tolerancia; sin embargo, su ingreso fue registrado posteriormente a lo autorizado y sin la debida coordinación formal, afectando el normal desarrollo de las actividades programadas.',
    plazo: 6,
  },
  {
    id: 'charla',
    nombre: 'Inasistencia a la charla de 5 minutos',
    asunto: 'Carta de imputación por inasistencia a la charla de 5 minutos',
    base: 'horario',
    fundamento:
      'Así, según nuestro reglamento interno de trabajo en el **Art. 66°** __“El colaborador deberá conocer y observar las normas contenidas en el Reglamento Interno de Seguridad y Salud en el Trabajo de Grupo Pecuario S.A.C., y cumplir puntual y responsablemente con las instrucciones, charlas, cursos, entre otras actividades que se realicen”__ y **Art. 92° inciso hh)** __“Participar activamente en los programas de capacitación, cursos, charlas; proporcionados por la empresa así como seguir las políticas e indicaciones respectivas”__.',
    hechos:
      'Según se constata usted ha incurrido en una falta al no participar en la **charla de 5 minutos** realizada el día **[fecha]** a las **7:00 a.m.** Se le recuerda que usted tiene conocimiento de que dicha actividad se lleva a cabo regularmente **todos los sábados**.',
    plazo: 6,
  },
  {
    id: 'funciones',
    nombre: 'Incumplimiento de funciones',
    asunto: 'Carta de imputación Incumplimiento funciones',
    base: 'faltas',
    fundamento: `${OBLIGACIONES}${ART_92_BCK}.`,
    hechos:
      'Según se constata que Ud. cometió una falta el día **[fecha]**, al no cumplir con las indicaciones y procedimientos establecidos para su puesto, incumpliendo sus funciones que son adherentes a su cargo.',
    plazo: 6,
  },
  {
    id: 'cobranza',
    nombre: 'Cobranza no reportada ni depositada',
    asunto: 'Carta de imputación por incumplimiento de funciones (cobranza)',
    base: 'faltas',
    fundamento: `${OBLIGACIONES}${ART_92_BCK}, **en su inciso qq)** __(Reportar la cobranza ante la empresa, inmediatamente después de ser efectuada)__, **en su inciso rr)** __(Realizar el depósito de la cobranza, en las cuentas proporcionadas por la empresa, el mismo día de ser efectuada ésta)__.`,
    hechos:
      'Según se constata que Ud. cometió una falta, al realizar la cobranza a sus clientes el día **[fecha]** y no reportarla ni entregar el efectivo y los recibos correspondientes en la fecha en que fue pagada, incumpliendo los procedimientos de control de cobranza que son adherentes a su cargo.',
    plazo: 6,
  },
  {
    id: 'bpm',
    nombre: 'Incumplimiento de BPM',
    asunto: 'Carta de imputación Incumplimiento BPM',
    base: 'faltas',
    fundamento: `${OBLIGACIONES}${ART_92_BCK}.`,
    hechos:
      'Según se constata que Ud. cometió una falta el día **[fecha]**, al no cumplir las buenas prácticas de manufactura (BPM), incumpliendo sus funciones que son adherentes a su cargo.',
    plazo: 6,
  },
  {
    id: 'confidencialidad',
    nombre: 'Falta de confidencialidad',
    asunto: 'Carta de imputación por confidencialidad',
    base: 'faltas',
    fundamento: `${OBLIGACIONES}en su **artículo 97°** menciona que “todo colaborador deberá mantener en absoluta confidencialidad y secreto, los documentos, materiales y en general toda la información, a la que haya tenido acceso durante el vínculo laboral o a cuya elaboración hubiera contribuido directa o indirectamente o de los cuales tenga conocimiento por razones diversas, independientemente del medio o soporte que la contenga, así como de los asuntos administrativos cuya divulgación pudiera causar perjuicio alguno a Grupo Pecuario S.A.C., a sus clientes, a sus proveedores y/o terceros en general.”`,
    hechos: 'Según se constata que Ud. cometió una falta grave el día **[fecha]**, al divulgar información interna de la empresa a personas no autorizadas.',
    plazo: 6,
  },
  {
    id: 'mala_fe',
    nombre: 'Mala fe laboral',
    asunto: 'Carta de imputación mala fe laboral',
    base: 'faltas',
    fundamento: `${OBLIGACIONES}en su **Art. 92°** Son obligaciones de los colaboradores **en su inciso c)** __“Conocer las características de sus labores, relacionadas cargo que ocupa y cumplir con **honradez, lealtad** y eficiencia las funciones y responsabilidades asignadas”__, **en su Art. 4°** __“Es política básica de Grupo Pecuario S.A.C., exigir una conducta de respeto mutuo, **basado en la buena fe**”__.`,
    hechos:
      'Según se constata en las cámaras de seguridad de la empresa, Ud. cometió una falta grave el día **[fecha]**, al revisar documentación e información categorizada como **INFORMACIÓN CONFIDENCIAL** sin autorización, manifestando un mal precedente en sus funciones y labores dentro de la empresa, incumpliendo lo estipulado en nuestro Reglamento Interno de Trabajo.',
    plazo: 6,
  },
  {
    id: 'convivencia',
    nombre: 'Falta de respeto / normas de convivencia',
    asunto: 'Imputación de cargo por incumplimiento de las normas de convivencia',
    base: 'faltas',
    fundamento: `Así, según nuestro reglamento interno de trabajo se les manifiesta a todos los trabajadores debemos mantener el respeto y buen clima laboral, lo cual es un elemento esencial para la realización correcta, efectiva de las labores asignadas, ${ART_4_39}`,
    hechos:
      'Según se informa Ud. cometió una falta grave el día **[fecha]**, al faltar el respeto a un compañero de trabajo, __**mostrando así una conducta negativa que infringe las normas internas, perjudicando así el buen clima laboral**__, incumpliendo lo estipulado en nuestro Reglamento Interno de Trabajo.',
    plazo: 6,
  },
  {
    id: 'alcohol',
    nombre: 'Bajo efectos del alcohol',
    asunto: 'Imputación de cargo por presentarse al trabajo bajo efectos del alcohol',
    base: 'faltas',
    fundamento: `${OBLIGACIONES}${ART_94_X}`,
    hechos:
      'Según se constata que Ud. cometió una **falta grave**, se presentó a su lugar de trabajo el día **[fecha]** evidenciando signos de estar bajo los efectos del alcohol. Ante esta situación, se procedió a realizarle la prueba de alcoholemia mediante alcoholímetro, la cual arrojó un resultado positivo.',
    plazo: 1,
  },
  {
    id: 'epp',
    nombre: 'Uso de EPP de otro colaborador',
    asunto: 'Carta de imputación incumplimiento del RISST (EPP)',
    base: 'faltas',
    fundamento:
      'Así, según nuestro Reglamento Interno de Seguridad y Salud en el Trabajo (RISST) se les manifiesta a todos los trabajadores la obligación de cumplir con las obligaciones y deberes, lo cual es un elemento esencial para la realización correcta, efectiva de las labores asignadas y mantener el buen clima laboral y en su **Art. 21°** son prohibiciones de los colaboradores en su **inciso 13)** __“Apropiarse o usar sin consentimiento los EPP de otro colaborador”__.',
    hechos:
      'Según se constata que Ud. cometió una falta el día **[fecha]**: a pesar de haber recibido sus respectivos EPP y contar con un casillero asignado para su adecuado resguardo, se evidenció que utilizaba el equipo de protección asignado a otro compañero, incumpliendo lo establecido en nuestro RISST.',
    plazo: 6,
  },
  {
    id: 'equipos_no_asignados',
    nombre: 'Uso de equipos no asignados (SST)',
    asunto: 'Carta de imputación incumplimiento normas de SST',
    base: 'faltas',
    fundamento: `${OBLIGACIONES}${ART_92_BCK}, en su **Art. 94°** queda expresamente prohibido a los colaboradores, **en su inciso r)** __(Manejar, operar, conducir y/o retirar de las instalaciones de la empresa, equipos, máquinas, vehículos, que no les han sido asignados por ser ajenos al cargo o la función que desempeña; salvo autorización expresa previa del superior jerárquico correspondiente)__.`,
    hechos:
      'Según se constata que Ud. incurrió en una **falta grave** el día **[fecha]**, al manipular un equipo sin contar con la debida autorización ni capacitación para su uso, incurriendo así en un **acto inseguro** que pudo haber derivado en un accidente laboral.',
    plazo: 6,
  },
  {
    id: 'insalubres',
    nombre: 'Condiciones insalubres / riesgo a la salud',
    asunto: 'Imputación de cargo por Incumplimiento de Normas Laborales y de Conducta',
    base: 'faltas',
    fundamento: `Así, según nuestro reglamento interno de trabajo ${ART_94_AA}.`,
    hechos:
      'Según nuestros registros, el día **[fecha]** usted incumplió las indicaciones médicas establecidas para su tratamiento, poniendo en riesgo su salud y la de las personas de su entorno, conducta incompatible con el motivo de su descanso médico.',
    plazo: 6,
  },
  {
    id: 'celular_proceso',
    nombre: 'Celular en sala de proceso',
    asunto: 'Carta de imputación por uso de celular en sala proceso',
    base: 'faltas',
    fundamento: `Así, según nuestro reglamento interno de trabajo se les prohíbe crear o fomentar condiciones insalubres dentro de las instalaciones de la empresa, ${ART_94_AA}, así también el documento de PROHIBICIÓN DEL INGRESO Y USO DE CELULARES PERSONALES EN LA SALA DE PROCESO en donde menciona que __“queda prohibido el ingreso y uso de celulares personales dentro de las salas de proceso”__ y también __“antes de ingresar a la sala de proceso, el colaborador deberá dejar su celular personal en el locker asignado con su respectivo candado”__.`,
    hechos:
      'Según se evidencia Ud. ingresó a la sala de proceso el **[fecha]** portando un teléfono celular, pese a tener conocimiento de que se encuentra prohibido el ingreso y uso de celulares dentro de las áreas de proceso. Por lo tanto, a nombre de la empresa se procede a presentar una imputación de cargos.',
    plazo: 6,
  },
  {
    id: 'celular_trabajo',
    nombre: 'Celular personal en el área de trabajo',
    asunto: 'Carta de imputación incumplimiento normas internas',
    base: 'faltas',
    fundamento: `${OBLIGACIONES}${ART_92_BCK}, y en la **política de uso de celulares** menciona __“Durante la jornada laboral, está prohibido el uso **NO AUTORIZADO** por el superior inmediato, de cualquier equipo electrónico y de comunicación”__.`,
    hechos:
      'Según se constata que Ud. ha incurrido en una falta: el día **[fecha]** estuvo haciendo uso de su celular personal en su área de trabajo, descuidando las funciones propias de su puesto.',
    plazo: 1,
  },
  {
    id: 'bienes',
    nombre: 'Uso indebido de bienes de la empresa',
    asunto: 'Imputación de cargo por Incumplimiento de Normas Internas y de Conducta',
    base: 'faltas',
    fundamento: `${OBLIGACIONES}en su **Art. 92°** Son obligaciones de los colaboradores **en su inciso s)** __(No utilizar o disponer de materiales, útiles o bienes de Grupo Pecuario S.A.C., en perjuicio del empleador y/o en beneficios propios o de terceros)__, **en su inciso w)** __(Cuidar y usar de manera adecuada los útiles de trabajo, mercadería, herramientas, instrumentos, equipos, y demás que le proporcione la empresa para la realización de sus labores)__.`,
    hechos:
      'Según se constata que Ud. realizó el día **[fecha]** un mal uso del **equipo institucional** que le fue asignado para el cumplimiento de sus funciones laborales, **para fines personales**, lo cual no se encuentra alineado con las normas internas de la empresa.',
    plazo: 6,
  },
  {
    id: 'danos',
    nombre: 'Daños por negligencia',
    asunto: 'Carta de imputación por Incumplimiento funciones (daños)',
    base: 'faltas',
    fundamento: `${OBLIGACIONES}${ART_92_BCK} y **Art. 126°** __(El colaborador es responsable por los daños ocasionados a los materiales, piezas o unidades, si se comprueba que tales daños se deben a su negligencia o imprudencia)__.`,
    hechos:
      'Según se constata que Ud. cometió una falta el día **[fecha]**, por dejar mal estacionado el vehículo asignado, ocasionando riesgo de daño a la unidad y a las instalaciones de la empresa.',
    plazo: 6,
  },
  {
    id: 'operaciones',
    nombre: 'Operaciones comerciales no reconocidas',
    asunto: 'Imputación de cargos y solicitud de descargos respecto de operaciones comerciales',
    base: 'faltas',
    fundamento: `${OBLIGACIONES}${ART_92_BCK}.`,
    hechos:
      'Por medio de la presente, **Grupo Pecuario S.A.C.**, en ejercicio de sus facultades de dirección, supervisión y control, le comunica que viene siendo materia de **revisión interna** el pedido registrado el día **[fecha]** a nombre de un cliente de su cartera, quien manifestó no reconocer dicha operación. Se requiere que presente capturas de las conversaciones, mensajes, correos u otros medios que acrediten la solicitud del pedido, la persona que recibió la mercadería y el lugar de entrega, de conformidad con el **artículo 31 del Texto Único Ordenado del Decreto Legislativo N.º 728**.',
    plazo: 6,
  },
];

export const buscarModelo = (id?: IdModelo) => MODELOS_IMPUTACION.find((m) => m.id === id) ?? MODELOS_IMPUTACION.find((m) => m.id === 'funciones')!;

/** Primer párrafo fijo de todas las cartas. */
export const parrafoBase = (base: ModeloImputacion['base']) =>
  `Mediante la presente carta debidamente notificada, se le recuerda que es potestad del empleador ${base === 'horario' ? 'asignar horario de trabajo para el trabajador' : 'asignar las faltas leves y graves para el trabajador'}, en base al Texto Único Ordenado del Decreto Legislativo Nº 728.`;

export const PARRAFO_EXHORTO =
  'Asimismo, esperamos que rectifique su actuar y se adecúe a las políticas establecidas en la empresa. Con esta comunicación lo exhortamos a cumplir cabalmente con el reglamento interno de trabajo y otras normas internas de nuestra institución.';

export const parrafoPlazo = (dias: number) =>
  `Le informamos que tiene un plazo de ${String(dias).padStart(2, '0')} ${dias === 1 ? 'día calendario' : 'días calendarios'} en caso considere pertinente presentar sus descargos, caso contrario se dará por aceptada su falta cometida.`;

/** Hechos del modelo con la fecha de la incidencia. */
export const hechosDeModelo = (m: ModeloImputacion, fechaTexto: string) =>
  // Texto simple para que RR. HH. lo edite sin marcas de formato.
  m.hechos.replaceAll('[fecha]', fechaTexto).replace(/\*\*|__/g, '');
