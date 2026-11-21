import { aDiaLocal } from '@/compartido/formato/fechas';
/**
 * Plantilla "Contrato de Trabajo por Incremento de Actividad", tomada del modelo de Gestión Humana
 * (combinación de correspondencia: NOMBRES, DNI, DIRECCIÓN, CARGO, MESES, DESDE, HASTA, SUELDO, HORARIO1, HORARIO2).
 * El texto se arma con la ficha del trabajador y lo que RR. HH. completa al generarlo.
 */
import { fechaEnTexto, montoSoles } from '@/compartido/formato/montos';

/** Empleador y representante, como figuran en el modelo de contrato de Gestión Humana. */
export const EMPLEADOR_CONTRATO = {
  razonSocial: 'GRUPO PECUARIO S.A.C',
  ruc: '20513967234',
  domicilio: 'AV. Canto Bello N° 177, Urb. Canto Bello, distrito de San Juan de Lurigancho, Lima',
  cargoRepresentante: 'Gerente Administrativo',
  // Nombre y DNI del representante: se leen de cliente/.env.local (no se suben al repositorio).
  representante: import.meta.env.VITE_GERENTE_ADMINISTRATIVO ?? 'Nombre del Gerente Administrativo',
  dniRepresentante: import.meta.env.VITE_DNI_GERENTE_ADMINISTRATIVO ?? '00000000',
  partida: '11915363',
  distritoFirma: 'San Juan de Lurigancho',
};

/** Asignación familiar (10 % de la remuneración mínima vital); se actualiza cuando cambia la RMV. */
export const ASIGNACION_FAMILIAR = 123;

/** Obligaciones comunes a todos los cargos (inicio y fin de la cláusula quinta). */
const OBLIGACIONES_INICIO = ['Cumplir con todas las órdenes y directivas relacionadas con su trabajo, que sean impartidas por su jefe y/o el superior jerárquico.'];
const OBLIGACIONES_FIN = [
  'Desempeñar su labor con eficiencia, lealtad, proactividad y diligencia.',
  'Trabajar en armonía y solidaridad con el resto de sus compañeros.',
  'Ser revisado por el personal de vigilancia al ingreso y a la salida de las instalaciones de la empresa.',
  'Brindar información veraz al EL EMPLEADOR, en cada una de las actividades realizadas en la empresa, esta obligación alcanza a todos aquellos requerimientos de información que este haya efectuado desde la etapa precontractual.',
  'Cumplir con las demás normas legales y administrativas, que pudieran surgir durante la vigencia de este contrato.',
];

/** Funciones propias por cargo. Se pueden editar al generar el contrato. */
export const FUNCIONES_POR_CARGO: Record<string, string[]> = {
  'SUPERVISOR DE OPERACIONES': [
    'Coordinar y articular las actividades de las áreas de Producción, Desarrollo, Logística, Distribución y Comercial, garantizando una adecuada integración de los procesos operativos.',
    'Establecer mecanismos de comunicación y coordinación entre las diferentes áreas, evitando duplicidad de funciones, retrasos, descoordinaciones y dificultades en el flujo de trabajo.',
    'Coordinar reuniones periódicas con los responsables de cada área para evaluar avances, identificar dificultades y establecer compromisos de cumplimiento.',
    'Identificar interferencias, restricciones y cuellos de botella entre las áreas, promoviendo soluciones que permitan mantener la continuidad de las operaciones.',
    'Identificar riesgos que puedan afectar la continuidad de las operaciones y establecer medidas preventivas y correctivas.',
    'Evaluar la capacidad operativa de las diferentes áreas, identificando limitaciones y necesidades de recursos.',
    'Analizar integralmente los procesos de la empresa, identificando actividades innecesarias, duplicidad de tareas, tiempos improductivos y oportunidades de mejora.',
    'Identificar y analizar los cuellos de botella que afectan la productividad, los tiempos de respuesta y el cumplimiento de los objetivos.',
    'Evaluar los tiempos de ejecución de los procesos, identificando oportunidades para reducir tiempos de espera, reprocesos y demoras.',
    'Promover la estandarización de procesos, estableciendo criterios uniformes de trabajo, controles y responsabilidades.',
    'Analizar los tiempos y costos de distribución, identificando oportunidades para optimizar rutas, cargas, frecuencias y utilización de unidades.',
    'Supervisar el cumplimiento de los compromisos de entrega, identificando incidencias y coordinando acciones correctivas.',
    'Coordinar con Comercial la planificación de la demanda, prioridades de atención, pedidos especiales y compromisos de entrega con los clientes.',
    'Verificar que los compromisos comerciales asumidos se encuentren alineados con la capacidad real de producción, inventario y distribución.',
    'Establecer mecanismos de comunicación para anticipar variaciones en la demanda y facilitar la planificación de las operaciones.',
    'Identificar problemas operativos que puedan afectar la satisfacción del cliente y coordinar soluciones con las áreas responsables.',
    'Diseñar, implementar y monitorear indicadores clave de desempeño (KPI) para evaluar la eficiencia y productividad de las diferentes áreas operativas.',
    'Analizar los resultados operativos, identificando desviaciones respecto a los objetivos, metas y presupuestos establecidos.',
    'Elaborar informes periódicos de gestión que permitan evaluar la productividad, costos, cumplimiento de programas, tiempos de respuesta y eficiencia de los procesos.',
    'Analizar las causas de incumplimientos, retrasos, sobrecostos y reprocesos, proponiendo acciones correctivas y preventivas.',
    'Capacitar a su equipo a cargo y educar a los gerentes, jefaturas y líderes sobre los enfoques de gestión de cambio y los impactos para la organización. Dentro de estos equipos, detectar a aquellas personas que puedan desempeñarse como agentes de cambio y entrenarlos para ello.',
    'Presentar informe escrito de su gestión realizada cada fin de mes a la Gerencia General y en casos excepcionales a solicitud de la Gerencia.',
  ],
};

/** Funciones del cargo: las del catálogo o, si el cargo no está, una línea genérica para completar. */
export const funcionesSugeridas = (cargo: string) =>
  FUNCIONES_POR_CARGO[cargo.trim().toUpperCase()] ?? ['Realizar las funciones propias del cargo, de acuerdo con las indicaciones de su jefe inmediato.'];

/** Cargo de confianza (art. 43 del D.L. 728): supervisores, jefes y gerentes. */
export const esCargoConfianza = (cargo: string) => /SUPERVISOR|JEFE|GERENTE|COORDINADOR/i.test(cargo);

export const MESES_CONTRATO = [1, 2, 3, 6, 12];

export interface DatosContrato {
  cargo: string;
  confianza: boolean;
  meses: number;
  /** AAAA-MM-DD; también es la fecha de firma. */
  desde: string;
  hasta: string;
  remuneracion: number;
  asignacionFamiliar: boolean;
  horario1: string;
  horario2: string;
  funciones: string[];
  /** Vendedores: el contrato lleva la adenda de obligaciones del vendedor como página adicional para firmar. */
  adendaVendedor?: boolean;
  trabajador: { nombre: string; dni: string; domicilio: string };
}

/** Fecha de fin: mismo día del mes final menos uno (16-nov + 3 meses → 15-feb). */
export function calcularHasta(desde: string, meses: number): string {
  const d = new Date(`${desde}T12:00:00`);
  d.setMonth(d.getMonth() + meses);
  d.setDate(d.getDate() - 1);
  return aDiaLocal(d);
}

export interface Seccion {
  titulo: string;
  parrafos: string[];
  /** Lista con letras o números, según el modelo. */
  lista?: { items: string[]; tipo: 'a' | '1' };
  /** Párrafos que van después de la lista. */
  despues?: string[];
  /** Segunda lista (causales de resolución en la cláusula quinta). */
  lista2?: { items: string[]; tipo: 'a' | '1' };
  final?: string[];
}

export interface ContratoArmado {
  titulo: string;
  introduccion: string;
  secciones: Seccion[];
  cierre: string;
}

const nombreDocumento = (nombre: string) => nombre.replace(',', '');

/** Arma el contrato completo para un trabajador. */
export function armarContrato(c: DatosContrato): ContratoArmado {
  const e = EMPLEADOR_CONTRATO;
  const cargo = c.cargo.toUpperCase();
  const sueldo = montoSoles(c.remuneracion);
  const asignacion = c.asignacionFamiliar ? ` y S/${ASIGNACION_FAMILIAR.toFixed(2)} soles de Asignación Familiar` : '';
  const confianza = c.confianza
    ? ` en la condición de cargo de confianza cuyo concepto se encuentra definido en el segundo párrafo del artículo 43º del Texto Único Ordenado del Decreto Legislativo N° 728, Ley de Productividad y Competitividad Laboral aprobado del Decreto Supremo Nº 003-97-TR.`
    : '.';

  return {
    titulo: 'CONTRATO DE TRABAJO POR INCREMENTO DE ACTIVIDAD',
    introduccion: `Conste por el presente documento el Contrato de Trabajo a plazo fijo bajo la modalidad de Incremento de Actividad, que celebran al amparo del Art. 57° de la Ley de Productividad y Competitividad Laboral, aprobado por D.S. N° 003-97-TR y normas complementarias, de una parte ${e.razonSocial} con RUC N° ${e.ruc}, con domicilio fiscal para estos efectos en la ${e.domicilio}, debidamente representado por su ${e.cargoRepresentante}, Señor ${e.representante}, identificado con DNI N° ${e.dniRepresentante}, cuyas facultades constan inscritas en la Partida Electrónica N° ${e.partida} del registro de personas jurídicas de Lima, a quien en adelante se le denominará EL EMPLEADOR; y de la otra parte don(ña) ${nombreDocumento(c.trabajador.nombre)}, identificado con DNI N° ${c.trabajador.dni}, con domicilio para estos efectos en ${c.trabajador.domicilio}, a quien en adelante se le denominará EL TRABAJADOR; en los términos y condiciones siguientes:`,
    secciones: [
      {
        titulo: 'CLAUSULA PRIMERA: ANTECEDENTES',
        parrafos: [
          'EL EMPLEADOR, es una empresa dedicada a la importación y comercialización de productos cárnicos congelados y derivados, que requiere cubrir las necesidades de recursos humanos, con el objeto de atender los incrementos suscitados en su actividad comercial.',
          `Por medio del presente documento, EL EMPLEADOR contrata los servicios de EL TRABAJADOR, a plazo fijo, bajo la modalidad de Incremento de Actividad, debido al aumento de los pedidos y ventas efectuados a los clientes que surgen en las nuevas zonas de expansión comercial de la empresa, quien desempeñará el cargo de ${cargo}${confianza}`,
          ...(c.confianza
            ? ['Personal de Confianza: Son aquellos que laboran en contacto personal y directo con el empleador o con el personal de dirección, teniendo acceso a secretos industriales, comerciales o profesionales y, en general, a información de carácter reservado. Asimismo, aquellos cuyas opiniones o informes son presentados directamente al personal de dirección, contribuyendo a la formación de las decisiones empresariales.']
            : []),
        ],
      },
      {
        titulo: 'CLAUSULA SEGUNDA: DURACIÓN DEL CONTRATO',
        parrafos: [
          `Queda establecido por las partes que, el plazo de vigencia de este contrato será de ${c.meses} ${c.meses === 1 ? 'mes' : 'meses'} en periodo de prueba, computado desde el ${fechaEnTexto(c.desde)} hasta el ${fechaEnTexto(c.hasta)}, el cual podrá ser renovado previo acuerdo entre las partes, sin que se exceda del límite permitido legalmente.`,
        ],
      },
      {
        titulo: 'CLAUSULA TERCERA: REMUNERACIÓN',
        parrafos: [
          `Por los servicios brindados en la cláusula segunda, EL TRABAJADOR percibirá una remuneración mensual de ${sueldo}${asignacion}. De este monto, EL EMPLEADOR deducirá las aportaciones y los descuentos por tributos, establecidos en la ley.`,
        ],
      },
      {
        titulo: 'CLAUSULA CUARTA: HORARIO DE TRABAJO',
        parrafos: [
          `Se deja expresa constancia que la jornada de trabajo a la que estará sujeto EL TRABAJADOR, será de 48 horas semanales y el horario de trabajo, será el siguiente: ${c.horario1}${c.horario2 ? ` y ${c.horario2}` : ''}, el refrigerio será de una hora.`,
        ],
      },
      {
        titulo: 'CLAUSULA QUINTA: DE LOS SERVICIOS',
        parrafos: ['EL TRABAJADOR se obliga a cumplir y/o acatar las normas y directivas que se impartan en el centro de trabajo, obligándose a:'],
        lista: { tipo: 'a', items: [...OBLIGACIONES_INICIO, ...c.funciones.filter((f) => f.trim()), ...OBLIGACIONES_FIN] },
        despues: [
          `Lo anterior se entiende sin perjuicio de cualquier otra labor complementaria e inherente a su cargo de ${cargo}.`,
          'Salvo lo previsto en la cláusula segunda, este contrato podrá darse por resuelto o rescindido, en los siguientes casos:',
        ],
        lista2: {
          tipo: '1',
          items: [
            'Por incurrir EL TRABAJADOR en falta grave laboral.',
            'Por incurrir EL TRABAJADOR en faltas leves laborales.',
            'Por mutuo disenso o acuerdo voluntario entre ambas partes.',
            'Por bajo rendimiento objetivamente comprobado de EL TRABAJADOR.',
            'Por causas legales previstas en las normas laborales que pudieran surgir durante la vigencia de este contrato y en las directivas administrativas internas de EL EMPLEADOR.',
          ],
        },
        final: [
          'Este contrato quedará concluido al vencimiento del plazo previsto en la cláusula segunda, salvo que sea renovado de manera previa a dicha fecha.',
          'De conformidad con el artículo 18° del D.S. N° 003-97-TR - Ley de Productividad y Competitividad Laboral - EL TRABAJADOR podrá renunciar o retirarse de forma voluntaria de la empresa, previo aviso por escrito con treinta (30) días calendario de anticipación.',
        ],
      },
      {
        titulo: 'CLAUSULA SEXTA: USO DE UTILES, MUEBLES, EQUIPOS, INFRAESTRUCTURA, CORREO ELECTRÓNICO Y OTROS',
        parrafos: [
          '6.1. Los útiles, equipos, muebles, infraestructura, correo electrónico, y cualquier otro bien o herramienta que EL EMPLEADOR ponga a disposición o proporcione a EL TRABAJADOR con ocasión del presente contrato, están destinados exclusivamente para el desarrollo de sus labores, por lo que EL TRABAJADOR se compromete a usarlos en forma correcta y pertinente.',
          '6.2. Los medios informáticos, incluido el correo electrónico, son herramientas de trabajo propiedad de EL EMPLEADOR tanto en relación con el hardware y software instalados como respecto de sus contenidos, y como tales están destinados para los fines del presente contrato. EL TRABAJADOR será responsable del uso de su contraseña personal, así como de la custodia de todos los documentos existentes en su ordenador, no pudiendo hacer uso de su contenido para fines distintos de los laborales, tampoco podrá utilizarlas fuera del ámbito de EL EMPLEADOR, salvo que tenga autorización expresa de EL EMPLEADOR para ello.',
          '6.3. Al término de la relación laboral, sea cual fuere la causa de extinción, EL TRABAJADOR se compromete a devolver a EL EMPLEADOR, todo material o documentación que, con ocasión de los servicios brindados, le fue brindada o se encuentre en su poder, tales como equipos, software, base de datos, hojas membretadas, materiales y útiles de oficina, mobiliario, entre otros.',
        ],
      },
      {
        titulo: 'CLAUSULA SÉTIMA: RESERVA Y CONFIDENCIALIDAD',
        parrafos: [
          `EL TRABAJADOR${c.confianza ? ', debido a su función directiva establecida en el presente contrato,' : ''} se obliga a mantener la confidencialidad sobre la información que reciba o genere durante la vigencia del presente contrato, la confidencialidad será de manera permanente durante la relación laboral y posterior a la extinción de la misma, estableciéndose que en caso se incumpla con dicha obligación de confidencialidad, EL TRABAJADOR deberá abonar a título de penalidad el equivalente a las remuneraciones percibidas durante la relación laboral con EL EMPLEADOR, sin más requisito que la intimación que este deba hacerle con la constancia, verificación o testimonio de la violación de la confidencialidad de EL TRABAJADOR en los términos mencionados en esta cláusula.`,
          '7.1 Guardar ante cualquier persona, entidad o empresa una discreción absoluta sobre cualquier actividad o información referida a EL EMPLEADOR y/o sus representantes, y/o clientes; a las que hubiera tenido acceso con motivo de la prestación de sus servicios.',
          '7.2 No revelar a ninguna persona, entidad o empresa, ni usar para ningún propósito en provecho propio o de terceros, cualquier información vinculada con EL EMPLEADOR y/o sus clientes.',
          '7.3 No difundir ni entregar, a otros trabajadores de la empresa, directa o indirectamente, ningún tipo de información confidencial o de propiedad de EL EMPLEADOR, salvo que dichos trabajadores necesiten conocer tal información por razón de sus funciones. En caso el solicitante no tenga la autorización para obtener la información que requiere e insista en reiteradas oportunidades a ello a EL TRABAJADOR, éste deberá informar inmediatamente tales hechos a su superior jerárquico inmediato.',
          '7.4 Si hubiese cualquier duda sobre lo que constituye información confidencial o sobre si la información debe ser revelada y a quien, EL TRABAJADOR se obliga a solicitar autorización de sus superiores por medio escrito o electrónico.',
          '7.5 La prohibición establecida en el numeral anterior se extiende a la reproducción en cualquier soporte de la información de EL EMPLEADOR, a la que tenga acceso sobre clientes, procedimientos y sistemas de organización, programas informáticos o cualquier otro tipo de información interna, salvo que tal información sea estrictamente necesaria para el desarrollo del contenido inherente de su puesto de trabajo y se realice dentro del ámbito de la empresa.',
          '7.6 Devolver a EL EMPLEADOR, al momento de extinguirse la relación laboral, sea cual fuere la causa, cualquier documento o información y/o papeles de trabajo que les hayan sido puestos a disposición o a los que hayan tenido acceso y que contengan y revelen información, de la cual haya sido responsable o no, que sea confidencial o de propiedad de EL EMPLEADOR.',
          '7.7 Todas las notas, informes y cualesquiera otros documentos (incluyendo los almacenados en dispositivos informáticos) elaborados por EL TRABAJADOR durante la vigencia del presente contrato y que se refieran a la actividad de la empresa son propiedad de la Empresa y serán diligentemente custodiados en la empresa y el trabajador responsable.',
          'Asimismo, en el supuesto de incumplimiento del compromiso asumido y con independencia de la extinción del contrato, EL EMPLEADOR se reserva el derecho de reclamar el resarcimiento de los daños y perjuicios que le pudieran causar como consecuencia de la vulneración del deber de confidencialidad y secreto profesional asumido por EL TRABAJADOR en la presente cláusula.',
          'La regulación de la presente clausula puede ser ampliada por el Reglamento Interno de Trabajo y/o Convenios de Confidencialidad y Reserva, siendo que las normas sobre confidencialidad y reserva que trate en sus respectivos capítulos o cláusulas no podrán entenderse como incompatibles o contradictorias a la presente clausula. Por tanto, EL TRABAJADOR se obliga a acatar todas las regulaciones internas sobre el Sistema de Confidencialidad y Reserva que rijan en EL EMPLEADOR.',
        ],
      },
      {
        titulo: 'CLAUSULA OCTAVA: PROPIEDAD INTELECTUAL',
        parrafos: [
          'EL TRABAJADOR reconoce expresamente que EL EMPLEADOR es titular de forma ilimitada y exclusiva, sin pago adicional de ninguna especie, de todos los derechos previstos en el artículo 312º de la Ley sobre el Derecho de Autor, Decreto Legislativo N.° 822, o norma que lo sustituya, respecto a los informes, documentos, invenciones, software, microfibras, obra, modelos, diseños, programas y en general todo procedimiento desarrollado en medios físicos y/o virtuales y/o digitales y/o cualquier elemento de estos o derivado de ellos, del que conozca o en el que intervenga, sea en forma directa o indirecta o con ocasión de las labores que desarrolla en cumplimiento de los servicios proporcionados a EL EMPLEADOR o sobre la base de la información proporcionada por EL EMPLEADOR.',
          'Todos aquellos productos, servicios y en general todo lo que EL TRABAJADOR genere en el desempeño de su actividad laboral, es de propiedad de EL EMPLEADOR, quien tiene la propiedad intelectual de todo aquellos que se produzca por EL TRABAJADOR durante la duración de este contrato, en atención a ello, EL TRABAJADOR no puede hacer uso particular, a título oneroso o gratuito de todo aquello que genere en su relación laboral, salvo que obtenga el permiso por escrito del Gerente General.',
          'Esta obligación se extiende de forma permanente al uso que se quiera dar de todo lo producido al servicio de la empresa, cuando haya culminado la relación laboral, si en dicho periodo EL TRABAJADOR quisiera hacer uso o aplicar alguna de las creaciones producidas mientras estuvo en ejecución del presente contrato de trabajo, requería también del permiso escrito del Gerente General.',
          'El incumplimiento de lo establecido en esta cláusula es falta grave que justifica el despido de EL TRABAJADOR mientras dure la relación laboral. En caso la violación de la cláusula se produzca cuando ya culmino la relación laboral, EL TRABAJADOR debe abonar a EL EMPLEADOR el importe de todas las remuneraciones percibidas durante la duración de la relación laboral objeto de este contrato.',
        ],
      },
      {
        titulo: 'CLAUSULA NOVENA: DOMICILIOS',
        parrafos: [
          'Las Partes acuerdan que, para cualquier efecto, los domicilios son los que se consignan en la introducción del presente documento, salvo que alguna de ellas comunique a la otra su variación por escrito, con una anticipación no menor de siete (7) días hábiles.',
        ],
      },
      {
        titulo: 'CLAUSULA DECIMA',
        parrafos: [
          'Todas las controversias, derivadas o relacionadas con este contrato, serán resueltas de forma definitiva mediante arbitraje de acuerdo con el Reglamento de Arbitraje del Centro Nacional e Internacional de Arbitraje de la Cámara de Comercio de Lima, a cuyas normas, administración y decisión se someten las partes en forma incondicional, declarando conocerlas y aceptarlas en su integridad. Renunciando a la competencia de autoridades distintas a la arbitral.',
        ],
      },
      {
        titulo: 'CLAUSULA DECIMA PRIMERA',
        parrafos: [
          'Este contrato queda sujeto a las disposiciones que contiene el Texto Único Ordenado del D.L. N° 728, aprobado por D.S. N° 003-97-TR - Ley de Productividad y Competitividad Laboral - y demás normas legales que lo regulen o que sean dictadas durante la vigencia del contrato.',
        ],
      },
    ],
    cierre: `Estando conformes con el contenido de todas las cláusulas del presente contrato, las partes lo suscriben e imprimen su huella dactilar, en el distrito de ${e.distritoFirma}, el ${fechaEnTexto(c.desde)}.`,
  };
}
