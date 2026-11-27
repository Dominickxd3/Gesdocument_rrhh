/**
 * Reglamento Interno de Trabajo de Grupo Pecuario S.A.C. (texto del documento de Gestión Humana, revisión vigente).
 * Se muestra completo antes del cargo de recepción, para que el colaborador lo lea antes de firmar.
 *
 * Formato del texto de cada capítulo: párrafos separados por una línea en blanco;
 * "Artículo N°.-" al inicio de un párrafo va en negrita; las líneas que empiezan con "a. ", "a) ", "- " o "• " son viñetas;
 * una línea en MAYÚSCULAS terminada en ":" es un subtítulo (INCENDIO:, HIGIENE:).
 */

export interface CapituloReglamento {
  numero: string;
  titulo: string;
  texto: string;
}

export const REGLAMENTO_INTERNO: CapituloReglamento[] = [
  {
    numero: 'I',
    titulo: 'DISPOSICIONES GENERALES',
    texto: `Artículo 1°.- Este reglamento comprende las disposiciones internas que regulan las relaciones entre Grupo Pecuario S.A.C. y sus colaboradores, tanto el que ingresa, el que brinda sus servicios en las diversas áreas de la organización, así como aquel que realiza sus servicios en las actividades que mantiene la empresa con sus clientes.

Artículo 2°.- Es deseo de Grupo Pecuario S.A.C. que sus colaboradores, tengan pleno conocimiento de sus derechos y deberes, de manera que puedan cumplir con sus labores, dentro de un espíritu de comprensión y entendimiento.

Artículo 3°.- Las disposiciones del presente Reglamento obligan tanto a Grupo Pecuario S.A.C., como a sus colaboradores, entendiéndose como tales a toda aquella persona que brinda servicios en favor de la empresa, cualquiera que fuera su cargo, función y rango jerárquico, sean estos hombres o mujeres.

Artículo 4°.- Es política básica de Grupo Pecuario S.A.C., exigir una conducta de respeto mutuo, basado en la buena fe y cortesía entre sus colaboradores.

Artículo 5°.- Este reglamento forma parte de los contratos individuales de trabajo, escritos o verbales, celebrados o que se celebren entre Grupo Pecuario S.A.C. y sus colaboradores.

Artículo 6°.- Grupo Pecuario S.A.C. es una organización dedicada a la importación y comercialización de productos cárnicos congelados. Esta actividad comercial, genera que la empresa mantenga relaciones constantes con diversos proveedores y clientes, tanto nacionales como extranjeros.

Artículo 7°.- Grupo Pecuario S.A.C. establecerá un organigrama interno, de acuerdo a sus intereses y creará rangos jerárquicos, según lo estime necesario. Por su parte, los colaboradores están obligados a cumplir las órdenes impartidas por el superior jerárquico.

Artículo 8°.- Grupo Pecuario S.A.C., por medio de las personas que designe y cuando lo estime conveniente, tendrá la facultad de revisar los paquetes, vehículos y demás pertenencias de los colaboradores, a las horas de entrada y salida del centro de labores. Los colaboradores deberán someterse a las medidas de seguridad, que se realicen en la empresa.

Artículo 9°.- Tanto los colaboradores de Grupo Pecuario S.A.C., así como los clientes y visitantes, tienen la obligación de mostrar y/o dejar su documento de identidad en el área de vigilancia. Dicho documento, permanecerá en el área de vigilancia, mientras dure su estadía en las instalaciones de la empresa.

Artículo 10°.- Entre otras facultades inherentes a su calidad de empleador y propietario, corresponde en forma exclusiva a Grupo Pecuario S.A.C., la administración y dirección de sus operaciones. Este derecho exclusivo no reconoce más limitaciones que las emanadas de la ley y de los contratos celebrados que estuvieran vigentes, comprendiendo:
a. Ser el único árbitro para determinar la capacidad e idoneidad de cualquier colaborador para el puesto o tarea a que haya sido asignado, apreciar sus méritos, definir cualquier ascenso y determinar el monto de sus remuneraciones.
b. Planear, dirigir, restringir y controlar las operaciones de Grupo Pecuario S.A.C.
c. La programación y establecimiento de las horas de trabajo, turnos y horarios, dentro del margen de la ley.
d. Dar la adecuada capacitación o inducción al personal nuevo o cuando se modifique o implante un nuevo procedimiento o metodología de trabajo.
e. La designación de trabajo y el personal que lo ejecutará.
f. Entrevistar, seleccionar y contratar nuevo personal.
g. Crear nuevas categorías de puestos o eliminar los que considere.
h. Efectuar cambios en los procedimientos, funciones y puestos que Grupo Pecuario S.A.C. considere para un mejor desenvolvimiento del personal, sin menoscabar el salario de éstos ni rebajar su categoría.
i. Establecer las descripciones del trabajo y sus obligaciones correspondientes a cada posición o función dentro del campo de acción de Grupo Pecuario S.A.C., modificándolas según las necesidades de la empresa, cambios en las operaciones, modernización de métodos y tecnología.
j. Formular directivas, normas y reglamentos que regulen la conducta y seguridad del personal de trabajo.
k. Amonestar, suspender y despedir a sus colaboradores, en aplicación de las disposiciones legales vigentes.
l. Transferir a sus colaboradores de un local a otro, de una sección a otra o de un turno a otro sin variación salarial ni rebaja de categoría, adhiriéndonos a las normativas o leyes vigentes.
m. Introducir cualquier tipo de entrenamiento que Grupo Pecuario S.A.C. estime conveniente, para el más eficiente desenvolvimiento de las funciones de los colaboradores y seleccionar el personal para dicho entrenamiento.
n. El poder de disponer la utilización de sus bienes, equipos, instalaciones y maquinarias en el modo y forma que estime más conveniente a sus intereses.

Artículo 11°.- La enumeración del artículo anterior no es limitativa, sino meramente enunciativa y a modo de ejemplo, pues son inherentes a los derechos de Dirección y Administración del empleador, las facultades de organizar, administrar, controlar y manejar su centro de trabajo, abarcando sus derechos toda la gama de prerrogativas que emanan de lo que las normas legales reconocen o no prohíben al empresario.`,
  },
  {
    numero: 'II',
    titulo: 'INICIO Y TERMINACIÓN DE LA RELACIÓN LABORAL',
    texto: `Artículo 12°.- La selección y contratación del personal, se efectuará por intermedio del Área de Gestión Humana, en coordinación con los superiores jerárquicos de los departamentos y las secciones respectivas de la empresa. La contratación de personal estará supeditada a las necesidades de las operaciones o los servicios que la empresa requiera, para brindar un mejor servicio en favor de sus clientes.

Artículo 13°.- Para formar parte de la organización de Grupo Pecuario S.A.C., es necesario cumplir con los siguientes requisitos:
a. Ser mayor de 18 años de edad. Excepcionalmente, se podrá evaluar a personas menores de 18 años de edad, siempre que cuenten con la debida autorización de sus padres.
b. Presentar los siguientes documentos: Documento Nacional de Identidad o Carnet de Extranjería; certificado policial, penal y/o judicial; certificado médico pertinente o carné de sanidad, emitido por centros médicos autorizados; declaración jurada de domicilio; certificados de los lugares donde ha trabajado anteriormente y/o certificados de estudios que acrediten conocimientos académicos y/o experiencia; llenar con su información personal, todos los documentos que le proporcione Grupo Pecuario S.A.C. (la información consignada en estos documentos, serán consideradas como declaraciones juradas, para todos los efectos legales); y entregar fotografías tamaño carnet, mirando de frente y con fondo blanco.
c. Ser aprobado en las evaluaciones efectuadas por Grupo Pecuario S.A.C. La solicitud de ingreso debe contar con la aprobación de la Gerencia del Área de Gestión Humana.

En ningún caso, la empresa podrá exigir como requisito de ingreso, ni durante la vigencia del contrato, la realización y exhibición de los resultados de la prueba de VIH.

Artículo 14°.- El contrato de trabajo podrá terminarse por retiro voluntario del colaborador, por acuerdo de las partes, o por decisión de Grupo Pecuario S.A.C., debiéndose en estos casos ceñirse a las disposiciones legales vigentes.

Artículo 15°.- Grupo Pecuario S.A.C. y el colaborador, de mutuo acuerdo, podrán exonerarse de los plazos respectivos, en caso de renuncia.`,
  },
  {
    numero: 'III',
    titulo: 'NORMAS SOBRE EL HORARIO DE TRABAJO Y CONTROL',
    texto: `Artículo 16°.- Es facultad de Grupo Pecuario S.A.C., fijar la duración de la jornada de trabajo, de los turnos y horarios dentro de los cuales ésta deberá cumplirse, así como la forma y modalidad de la prestación de las labores, con criterios de razonabilidad y teniendo en cuenta las necesidades del centro de trabajo. La jornada de trabajo se fija teniendo en consideración el límite previsto en la ley. Los colaboradores están obligados a respetar y cumplir la jornada y el horario de trabajo que fije la empresa, pudiendo ésta establecerlos y variarlos, en función a la naturaleza de las labores que deben prestarse.

El horario de trabajo en Grupo Pecuario S.A.C., es el establecido en los artículos 17°, 18° y 19° de este Capítulo. Todos los colaboradores de Grupo Pecuario S.A.C. tienen la obligación de cumplir con el horario de trabajo, para tener derecho a su sueldo.

Artículo 17°.- La jornada de trabajo es de 48 horas semanales, las que serán distribuidas en no más de 6 días a la semana, de lunes a sábado. Los colaboradores interrumpirán sus labores diariamente durante una (1) hora como máximo, para cumplir con su horario de refrigerio, el cual no es computable dentro del horario laboral ordinario.

Artículo 18°.- Todo colaborador tendrá derecho a descansar el día domingo de cada semana; sin embargo, para aquellos colaboradores que deban efectuar labores el día domingo o feriado, Grupo Pecuario S.A.C. señalará el día de su respectivo descanso sustitutorio, de acuerdo con la legislación vigente.

Artículo 19°.- Los colaboradores de Grupo Pecuario S.A.C., respetarán el horario establecido en el artículo 17°, sometiéndose a las políticas de control de asistencia que la empresa les comunique y que estarán adecuados al lugar y a la operación por la cual han sido contratados, dentro del marco legal pertinente; especialmente, en lo que concierne a los registros de hora de ingreso y hora de salida. También deberán cumplir con los horarios establecidos como interrupciones, por concepto de refrigerio.

Artículo 20°.- Para que el colaborador pueda realizar labores remuneradas, de naturaleza extraordinaria, es necesario que previamente cuente con la respectiva autorización por escrito del superior jerárquico. La sola permanencia voluntaria por parte del colaborador, con anterioridad a la iniciación o terminación de la jornada, no constituye trabajo extraordinario.

Artículo 21°.- El trabajo extraordinario es por su propia naturaleza, facultativo. La empresa no está obligada a proporcionar trabajo extraordinario a sus colaboradores. La prestación de trabajo extraordinario es voluntaria; sin embargo, si un colaborador se compromete a trabajar en sobretiempo o laborar en días feriados no laborables, queda obligado a cumplir su compromiso. Tal es así que, su inasistencia, constituye una falta que estará sujeta a medida disciplinaria.

Igualmente, Grupo Pecuario S.A.C. designará a los colaboradores que fueran necesarios para que laboren horas extra, en los casos especiales de emergencia, por situaciones imprevistas, tales como: desastres naturales, accidentes, etc.

Artículo 22°.- El personal que tenga necesidad de salir del centro de labores, durante el horario de trabajo, deberá entregar al área de Gestión Humana y al área Vigilancia, su papeleta de salida, previamente autorizada por el superior jerárquico, debiendo registrar su salida, en la planilla pertinente. Este tiempo transcurrido, no será remunerado por la empresa, salvo que exista acuerdo previo en sentido contrario.`,
  },
  {
    numero: 'IV',
    titulo: 'NORMAS DE PAGO DE HORAS EXTRA',
    texto: `Artículo 23°.- El pago que realiza la empresa en favor de sus colaboradores, es por la jornada cumplida. Cualquier pago por concepto de horas extraordinarias, se corresponderá con el tiempo de labores que el colaborador hubiere efectuado en favor de la empresa, fuera de los horarios establecidos.

Artículo 24°.- El trabajo extraordinario podrá ser utilizado para compensar faltas, permisos o tardanzas, previo acuerdo de las partes y de conformidad con las políticas que la empresa fije para tales efectos.

No está autorizado el pago de horas extra, al personal que ostente algún rango jerárquico, con responsabilidad por mando de personal y/o que trabaje sin la fiscalización del superior jerárquico.

Artículo 25°.- Todos los colaboradores, con excepción del Gerente General, Directores, Gerentes, Jefes de Área, así como el personal que por la naturaleza de su cargo o función, no se encuentre sujeto a la fiscalización del superior jerárquico, deberán registrar sus horas de entrada y salida a las instalaciones de la empresa, inclusive al salir y regresar para tomar el descanso correspondiente al refrigerio.

Entonces, están exonerados de registrar su control de asistencia, el personal que ejecute en forma oficial, labores de supervisión directa o indirecta a otros colaboradores. Esta exoneración no exime al personal, de cumplir estrictamente con el horario de trabajo. Grupo Pecuario S.A.C. se reserva el derecho de aplicar las sanciones que correspondan, de conformidad con la ley y las estipulaciones de este reglamento, cuando se produzca el incumplimiento de éste artículo.

Artículo 26°.- Los colaboradores deberán marcar sus respectivas tarjetas, o firmar los registros de control de asistencia, antes de iniciar y después de terminar sus labores en la empresa, así como cuando hagan uso de permisos, concedidos por Grupo Pecuario S.A.C.

Cualquier tiempo utilizado para cambiarse de ropa o aseo personal, no es considerado como parte de la jornada de trabajo, ya que es obligación de los colaboradores, al marcar su tarjeta o firmar el registro de control de asistencia, que lo hagan en condiciones óptimas y con los implementos respectivos.

Artículo 27°.- No existe justificación para la omisión del registro de control de asistencia. Si el colaborador no encontrara la hoja de control o la tarjeta, en el lugar que corresponde, deberá informar inmediatamente al superior jerárquico.

Artículo 28°.- Bajo ninguna circunstancia, está permitido registrar la asistencia o salida de otro colaborador.

Artículo 29°.- El colaborador que llegue tarde al centro de labores, deberá solicitar autorización al superior jerárquico para que, en coordinación con el Área de Gestión Humana, se evalúe la autorización de su ingreso o no, a las instalaciones de la empresa. El colaborador que tenga la costumbre de llegar tarde, no podrá acogerse a este artículo y se le aplicará la sanción que corresponda, por cometer esta falta.

Las tardanzas reiteradas al centro de labores, será considerado como falta grave, por evidenciar un desacato directo del colaborador, respecto de lo establecido en este reglamento. En consecuencia, en estos casos, la empresa tendrá expedita la facultad de resolver el contrato de trabajo que hubiera suscrito con el colaborador.

Artículo 30°.- Salvo los Directores, Gerentes, Jefes y personal en puestos jerarquizados de responsabilidad, ningún colaborador puede permanecer dentro de las instalaciones de Grupo Pecuario S.A.C., por más de 30 minutos después de la hora de salida; salvo que el colaborador tenga autorización o permiso especial para ello o se esté ejecutando lo establecido en el artículo 24° del presente reglamento. El tiempo que el colaborador permanezca en la empresa, fuera del horario de trabajo, sin autorización previa del superior jerárquico, no se computará como trabajo extraordinario.

En este contexto, cualquier hecho que pudiera suscitarse en las instalaciones de la empresa, durante el tiempo de permanencia no autorizado de un colaborador, es de absoluta responsabilidad de éste y será asumido por el colaborador, a su cuenta y riesgo.

Artículo 31°.- No serán consideradas como horas de trabajo extraordinarias, aquellas reportadas unilateralmente por el colaborador en los informes de diversa naturaleza que pudiera presentar al superior jerárquico. Para que las horas extraordinarias de trabajo, sean reconocidas por la empresa, es indispensable que se encuentren detalladas en el formato de autorización de horas extra que proporciona la empresa, debidamente firmado y autorizado por los superiores jerárquicos correspondientes.`,
  },
  {
    numero: 'V',
    titulo: 'DESCANSO, FORMA DE PAGO Y VACACIONES',
    texto: `Artículo 32°.- Para tener derecho a su remuneración, el colaborador deberá cumplir con el horario establecido por la empresa.

Las horas o los días de paralización de trabajo por casos fortuitos o de fuerza mayor, serán materia de evaluación y coordinación entre la empresa y el colaborador, para efectos de determinar el pago o no, de la compensación que corresponda, en favor del colaborador.

Artículo 33°.- El personal recibirá como remuneración, la establecida por Grupo Pecuario S.A.C.; la cual, en ningún caso, será inferior al salario mínimo legal vigente.

Artículo 34°.- El pago de la remuneración que efectúa el empleador en favor de los trabajadores, se realizará el último día calendario del mes.

Si el último día calendario del mes, coincide con un día no hábil (domingo o feriado) el empleador podrá efectuar el pago de la remuneración respectiva, el día hábil más próximo.

Asimismo, el colaborador que lo considere necesario, podrá solicitar mensualmente, ante el superior jerárquico, el adelanto de su remuneración en la quincena del mes, la cual podrá ser hasta el 45% de su sueldo neto.

Artículo 35°.- La remuneración del colaborador, será abonada en la cuenta de haberes correspondiente, en los días de pago establecidos.

Artículo 36°.- La remuneración vacacional será calculada y abonada, antes del inicio del descanso del colaborador, en total concordancia con la ley. El pago de la remuneración vacacional se efectuará a la cuenta de haberes del colaborador.

Las vacaciones son acordadas entre el superior jerárquico y el colaborador. En caso de no mediar acuerdo, Grupo Pecuario S.A.C. podrá determinar la fecha de inicio del período vacacional. Cualquiera que sea el caso, se debe tener en cuenta las necesidades del funcionamiento de la empresa y los intereses propios del colaborador.

El descanso vacacional del colaborador, consta de treinta (30) días calendario, por cada año completo de servicios. El colaborador deberá disfrutar de su descanso vacacional, preferentemente, en forma efectiva e ininterrumpida; sin embargo, mediante solicitud presentada por escrito ante el superior jerárquico y previa coordinación con el área de Gestión Humana, se podrá autorizar que el colaborador efectúe el goce fraccionado de su descanso vacacional, de conformidad con lo establecido en la normatividad laboral vigente.

Mediante acuerdo suscrito entre la empresa y el colaborador, se puede establecer el fraccionamiento de su descanso vacacional, sin que ello afecte su derecho al descanso vacacional de por lo menos siete (7) días calendario, el descanso vacacional puede reducirse de treinta (30) a quince (15) días, con la respectiva compensación de quince (15) días de remuneración.

La empresa establecerá el rol vacacional, solicitando para ello la participación de los responsables que corresponda, a fin de que coordinen con los colaboradores pertenecientes a su área, para definir la oportunidad de su descanso vacacional. Se brindará facilidades para que los colaboradores puedan gozar del período vacacional en forma fraccionada, de acuerdo a lo establecido en los dispositivos legales vigentes. Es responsabilidad del superior jerárquico inmediato, velar porque se cumpla con el rol del descanso vacacional programado.

El colaborador, antes de gozar de su descanso vacacional, deberá hacer entrega del puesto a la persona que designe el superior jerárquico inmediato. No se podrán acumular vacaciones correspondientes a dos (2) años consecutivos.`,
  },
  {
    numero: 'VI',
    titulo: 'NORMAS DE MANTENIMIENTO DE BIENES',
    texto: `Artículo 37°.- El mantenimiento de las oficinas, bienes muebles, maquinarias, vehículos, equipos y demás pertenencias de Grupo Pecuario S.A.C. debe ser realizada por el personal contratado para tales efectos y/o el personal que hace uso de dicha maquinaria, en los días y horas que la empresa determine.

Artículo 38°.- El colaborador que tenga a su cargo equipos o herramientas de trabajo y considere que su estado o funcionamiento es defectuoso, por motivo de su normal uso, deberá comunicarlo en el más breve plazo al superior jerárquico inmediato.

En caso de que se detecte que el estado y/o el funcionamiento de los equipos o herramientas fuera defectuoso, por causas de imprudencia o negligencia en su utilización, el colaborador encargado del bien, deberá asumir el costo de la reparación parcial o total de los daños que fueran necesarios.`,
  },
  {
    numero: 'VII',
    titulo: 'MANTENIMIENTO DE LA ARMONÍA LABORAL Y PROCEDIMIENTO DE RECLAMOS',
    texto: `Artículo 39°.- La empresa promueve el respeto mutuo y cordialidad entre todos los colaboradores, sin soslayar los principios de autoridad, orden y disciplina. El Área de Gestión Humana es la encargada de ejecutar las políticas y normas tendientes al mantenimiento de la paz y armonía laboral, dentro de la empresa.

Artículo 40°.- Grupo Pecuario S.A.C. ofrece la oportunidad a sus colaboradores para exponer sus reclamos o quejas en caso de cualquier disconformidad. Para tal efecto, el colaborador deberá exponer el motivo de su queja o reclamo al superior jerárquico inmediato, quien en coordinación con el Área de Gestión Humana, resolverán el caso en un plazo máximo de tres (3) días, salvo excepciones por la complejidad del asunto.

Artículo 41°.- El superior jerárquico está facultado para conocer y resolver los problemas relacionados con los colaboradores a su mando, sin perjuicio de realizar los actos de investigación que fueran necesarios. Si por efecto de las investigaciones realizadas, se determina que algún colaborador es responsable del problema suscitado, ya sea en todo o en parte, el superior jerárquico, en coordinación con el Área de Gestión Humana, podrá amonestar o suspender a dicho colaborador, en aplicación de lo establecido en el presente reglamento, en el capítulo de derechos, obligaciones y prohibiciones y el capítulo de régimen disciplinario.`,
  },
  {
    numero: 'VIII',
    titulo: 'NORMAS SOBRE EL LUGAR DE TRABAJO',
    texto: `Artículo 42°.- El trabajo de los colaboradores, se realizará en las oficinas o plantas, tanto de Grupo Pecuario S.A.C. como de los lugares donde se prestará los servicios contratados.

Artículo 43°.- Los colaboradores que prestan sus servicios en lugar fijo, debe comenzar y terminar sus labores en dicho lugar, de acuerdo a los horarios establecidos.

Artículo 44°.- En el caso de los colaboradores que puedan prestar sus servicios en lugares no fijos, o lugares ajenos a Grupo Pecuario S.A.C., la empresa determinará el horario adecuado para cada caso, siempre respetando lo establecido en las normas laborales vigentes.

Artículo 45°.- Grupo Pecuario S.A.C. hace entrega al colaborador de los equipos, herramientas, implementos o útiles necesarios para el trabajo. En caso de pérdida o deterioro injustificado, el colaborador deberá restituir el bien entregado por la empresa, de la misma marca, calidad y características. Si ello no fuera, el colaborador pagará el valor del bien para que la empresa pueda restituirlo.`,
  },
  {
    numero: 'IX',
    titulo: 'NORMAS SOBRE EL REFRIGERIO EN EL TRABAJO',
    texto: `Artículo 46°.- El tiempo de refrigerio no se computa como jornada de trabajo. Los colaboradores dispondrán de una (1) hora para tomar su refrigerio, de acuerdo a lo establecido en el Art. 17° de presente reglamento.

La empresa determinará, según las circunstancias, el sistema más conveniente para que los colaboradores ingieran sus alimentos, ya sea en un lugar determinado o permitiendo a los colaboradores, salir de las instalaciones de la empresa para este fin.

Artículo 47°.- Está terminantemente prohibido, ingerir alimentos fuera del lugar y horas establecidas por la empresa.

No obstante, esta excepción no aplica, cuando la empresa establezca horarios determinados, para que los colaboradores puedan ingerir sus alimentos, durante un período corto de tiempo. Este período corto de tiempo para ingerir alimentos, se denominará “break”.`,
  },
  {
    numero: 'X',
    titulo: 'NORMAS SOBRE EL USO DEL UNIFORME DE TRABAJO',
    texto: `Artículo 48°.- Grupo Pecuario S.A.C. proporcionará a sus colaboradores, el uniforme que corresponda, de acuerdo a la actividad que realicen, y su uso será obligatorio para el desempeño de sus funciones.

Artículo 49°.- El uniforme de trabajo será de propiedad de Grupo Pecuario S.A.C., de manera tal que, cuando se termine el vínculo laboral, el colaborador deberá devolver el mismo a la empresa. De no hacerlo, se descontará el precio del uniforme, antes de efectuar la liquidación del colaborador.

Artículo 50°.- El colaborador que reciba un uniforme, está obligado a llevarlo puesto durante las horas de trabajo en la empresa.

Artículo 51°.- El colaborador a quien la empresa proporcione un uniforme de trabajo, debe mantenerlo limpio y en buen estado de conservación. El lavado, cuidado y planchado del uniforme de trabajo, está a cargo del colaborador, quien lo deberá realizar fuera de las instalaciones de la empresa, a menos que tenga autorización expresa, para que lo realice dentro de las mismas.

Artículo 52°.- Es obligación del colaborador, asistir y realizar sus funciones con el uniforme adecuado; de lo contrario, no se le permitirá el ingreso o el desempeño de sus labores. En caso de incumplimiento, la empresa podrá aplicar la sanción que corresponda, en aplicación de lo establecido en el presente reglamento, en el capítulo de derechos, obligaciones y prohibiciones y el capítulo de régimen disciplinario.

Artículo 53°.- En caso de pérdida, deterioro injustificado o presentar el uniforme sucio, el colaborador deberá solicitar su reposición al superior jerárquico inmediato, asumiendo su valor económico, según corresponda.`,
  },
  {
    numero: 'XI',
    titulo: 'NORMAS SOBRE PERMISOS, LICENCIAS E INASISTENCIAS EN EL CENTRO DE TRABAJO',
    texto: `Artículo 54°.- Debido a que el sistema de trabajo en la empresa, es un sistema en el cual las labores se realizan en forma continua, la ausencia de cualquier colaborador, puede generar serios perjuicios en la producción de la empresa.

Artículo 55°.- Permiso o licencia, con o sin goce de haber, es toda autorización que faculta al colaborador, interrumpir sus labores habituales.

El permiso, se otorga por horas y en caso de requerirse plazos mayores, se le denominará licencia.

Artículo 56°.- Los permisos y/o licencias, deberán ser solicitados y concedidos, para atender situaciones de emergencia impostergables.

El colaborador que necesite un permiso o licencia, deberá solicitarlo ante el superior jerárquico inmediato, con un mínimo de veinticuatro (24) horas de anticipación. El superior jerárquico que reciba tal solicitud, analizará la petición y en caso corresponda, deberá gestionar la autorización correspondiente, firmando la papeleta de salida del colaborador. Dicha papeleta de salida del colaborador, deberá contener el visado correspondiente del área de Gestión Humana, de lo contrario, no tendrá validez.

El retiro del colaborador del centro de labores, sin la observancia de lo establecido en el presente artículo, producirá que su retiro sea considerado como una falta al trabajo injustificada, dando lugar a los descuentos y sanciones que correspondan.

Artículo 57°.- El otorgamiento de permisos y/o licencias por motivos particulares, es facultad exclusiva de Grupo Pecuario S.A.C. su autorización estará sujeta a las necesidades propias del trabajo y las características específicas de las circunstancias que las originen.

Cuando el colaborador solicite un permiso o licencia por asuntos personales, además de lo establecido en el artículo precedente, el superior jerárquico inmediato deberá redactar informe en el cual manifieste su opinión respecto de la petición del colaborador. Solo se concederá este permiso o licencia, cuando no existan antecedentes de abuso o exceso en este tipo de solicitudes por parte del colaborador. En este caso se le otorgará un permiso de tres (3) horas que serán compensables, pero si fuesen de cuatro (4) horas a más, éstas serán consideradas licencia sin goce de haber.

En cualquier caso, Grupo Pecuario S.A.C. se reserva el derecho de otorgar el permiso o licencia, con o sin goce de haber. Este último, priva al colaborador de la remuneración correspondiente, en forma proporcional al tiempo dejado de laborar.

Artículo 58°.- En el caso de ausencias, sin el permiso o licencia previa, el colaborador deberá comunicar su falta al centro de labores, al superior jerárquico inmediato o en su defecto, al área de Gestión Humana, comunicándose con cualquiera de ellos, con una anticipación no menor a dos (2) horas, antes de su horario de ingreso.

Si el colaborador no pudiera comunicarse por cualquier motivo, puede hacerlo cualquiera de sus familiares, exponiendo las razones que motivaron la falta al centro de labores, del colaborador. Cuando el colaborador acuda al centro de labores, deberá comprobar a través de documentos, el motivo por el cual faltó a sus labores en la empresa. De esta manera, la empresa evaluará la situación y aplicará el procedimiento establecido en el artículo 99°, según corresponda.

Artículo 59°.- Cuando el colaborador presente un descanso médico, únicamente será reconocido el Certificado de Incapacidad Temporal para el Trabajo – CITT, el cual es el documento oficial de EsSalud, y el descanso médico emitido por el Seguro Complementario de Trabajo de Riesgo - SCTR, mediante el cual se constata el tipo de contingencia (enfermedad, accidente o maternidad). Si el colaborador presente cualquier otro tipo de certificado médico, su ausencia será considerada como falta.

En caso de ausencia, el colaborador o cualquiera de sus familiares, deberá comunicarse con Grupo Pecuario S.A.C. y presentar dentro de las veinticuatro (24) horas siguientes a la inasistencia, el documento antes mencionado (CITT). Si el colaborador no se comunica con la empresa o no presenta el CITT dentro del plazo señalado, su inasistencia será considerada como una falta injustificada y en consecuencia, se le aplicará un descuento y la sanción que corresponda, en aplicación de lo establecido en el presente reglamento, en el capítulo de derechos, obligaciones y prohibiciones y el capítulo de régimen disciplinario.

Para el caso de las colaboradoras que se encuentren en estado de gestación, de acuerdo a la Ley N° 30367, estas contarán con una LICENCIA DE MATERNIDAD con un período de descanso justificado de 49 días, por el período prenatal y 49 días, por el período post natal. Para ello, deberán acreditar su condición de gestantes, a través del informe y el certificado médico correspondiente (CITT). El goce del citado descanso prenatal, podrá ser diferido, parcial o total, incluso acumulado con el post natal, a decisión de la colaboradora gestante. Esa decisión deberá ser comunicada al superior jerárquico inmediato, con una anticipación no menor de dos (2) meses, a la fecha probable de parto.

Es preciso señalar que la colaboradora, al término de su período post natal, cuenta con el derecho a una hora de permiso justificado por lactancia materna, hasta que su hijo tenga un año de edad, esto de conformidad con la ley laboral vigente.

Artículo 60°.- En los casos de ausencia del colaborador, por distinta que sea la causa, Grupo Pecuario S.A.C. se reserva el derecho de enviar un médico visitador o asistencia social a visitarlo en su domicilio, para los fines que la empresa considere pertinentes.

Artículo 61°.- Además de las ausencias justificadas contempladas por la ley, Grupo Pecuario S.A.C. reconoce como justificación y sin pérdida de remuneración, las ausencias debidamente comprobadas, por fallecimiento de parientes cercanos de primer grado (cónyuge, hijos, hermanos y padres).

Se considerarán ausencias debidamente comprobadas en estos casos, aquellas en que el colaborador cumpla con presentar la partida de defunción respectiva. En este caso se le otorgará la LICENCIA POR LUTO, que consiste en cinco (5) días calendario, si su familiar se encontraba en la ciudad de Lima y hasta tres (3) días calendario adicional, para los lugares fuera de Lima.

En el caso de un alumbramiento de su cónyuge o conviviente de un colaborador, según Ley N° 30807, este recibirá una LICENCIA POR PATERNIDAD que constará de diez (10) días calendarios consecutivos con goce de haber, en los casos de parto normal o cesárea, en la cual el colaborador decidirá la fecha inicio de la licencia, según las siguientes alternativas: desde la fecha de nacimiento del hijo(a), desde la fecha que la madre y/o hijo(a) son dados de alta por el centro médico, a partir del tercer día anterior a la fecha probable de parto, que será acreditada con el certificado médico correspondiente, para ello el trabajador debe comunicar a su jefe directo la fecha probable de parto con una anticipación de 15 días naturales.

Artículo 62°.- Las FALTAS INJUSTIFICADAS, son aquellas en las que el colaborador no brinda el sustento debido de la falta, no presenta ningún tipo de documentación o no se encuentra explicación razonable que justifique dicha falta. En ésta circunstancia, la empresa evaluará la situación y aplicará el procedimiento establecido en el artículo 99°, según corresponda.

Artículo 63°.- Para que el permiso o licencia concedido por Grupo Pecuario S.A.C., sea uno con goce de haber, es necesario que el colaborador presente el CITT y cualquier otro documento adicional que acredite lo manifestado en la justificación de su falta. De no cumplirse con estos requisitos, la empresa evaluará si corresponde o no, que la ausencia del colaborador sea con o sin goce de haber.

Artículo 64°.- Es preciso señalar que, de acuerdo al Decreto Supremo N° 003-97-TR -Texto Único Ordenado (TUO) de la Ley de Productividad y Competitividad Laboral- en su artículo 25°, literal h), establece que se considerará falta grave, el abandono de trabajo por más de tres (3) días consecutivos, las ausencias injustificadas por más de cinco (5) días en un período de treinta días calendario o más de quince (15) días en un período de ciento ochenta días calendario; hayan sido o no sancionadas disciplinariamente en cada caso, la impuntualidad reiterada, si ha sido acusada por el empleador, siempre que se hayan aplicado sanciones disciplinarias previas de amonestaciones escritas y suspensiones.`,
  },
  {
    numero: 'XII',
    titulo: 'NORMAS SOBRE PREVENCIÓN DE ACCIDENTES',
    texto: `Artículo 65°.- Los colaboradores están obligados a someterse a las prácticas y simulacros que Grupo Pecuario S.A.C. organice y ejecute. Asimismo, si las instituciones donde la empresa tiene colaboradores prestando el servicio, organizan y ejecutan prácticas y simulacros sobre seguridad, los colaboradores deberán participar.

Artículo 66°.- El colaborador deberá conocer y observar las normas contenidas en el Reglamento Interno de Seguridad y Salud en el Trabajo de Grupo Pecuario S.A.C., teniendo adicionalmente la obligación de asistir a las capacitaciones (4 obligatorias anuales) y cumplir puntual y responsablemente con las instrucciones, charlas, cursos, entre otras actividades que se realicen.

Artículo 67°.- Queda estrictamente prohibido que colaboradores no especializados, realicen arreglos de motores, limpieza de máquinas o equipos de cualquier clase y/o efectuar en los mismos, composturas o reparaciones que deben ser ejecutadas por personas especialmente preparadas y/o capacitadas para ese trabajo.

Artículo 68°.- Los colaboradores están obligados a tomar toda clase de medidas de precaución para evitar que se produzca fuego o chispas por cualquier medio, cerca de los locales donde existan sustancias o materiales inflamables, como son: gasolina, solventes, pinturas y productos similares, que procedan o se compongan de aquellos. Asimismo, deberán observar y cumplir fiel y estrictamente todas las normas, reglamentos, prohibiciones y disposiciones que tengan relación directa con los programas de seguridad y salud en el trabajo, dentro de las oficinas, plantas, almacenes y cuanta dependencia aparezca en el área de operaciones laborales, que involucren su participación directa.

Artículo 69°.- Los colaboradores que realicen tareas de riesgo, tienen la obligación de tomar todas las medidas de precaución y utilizar el equipo de protección personal (EPP) que le proporciona Grupo Pecuario S.A.C., así como seguir cualquier instrucción que al respecto se le proporcione.

Artículo 70°.- Salvo instrucciones especiales del superior jerárquico, ningún colaborador deberá mover protectores, señales de peligro u otros equipos destinados a proteger a los colaboradores mientras laboran.

INCENDIO:

Artículo 71°.- Queda prohibido cambiar de lugar los extinguidores que están instalados en las oficinas para casos de incendio, así como descargarlos o manejarlos en cualquier forma, a menos que se necesiten para combatir un incendio.

Artículo 72°.- En caso de algún indicio de incendio, el personal tendrá la obligación de comunicar el hecho inmediatamente y dar las señales de alarma a la brigada contra incendio, conformada para tal fin, según las instrucciones proporcionadas por Grupo Pecuario S.A.C., prestando su cooperación durante todo el tiempo que sea necesario.

HIGIENE:

Artículo 73°.- Todo el personal de la empresa, está obligado a prestar su ayuda para mantener la limpieza general de las oficinas y de la planta, no debiendo manchar o deteriorar las paredes, columnas, propiedades, etc. de Grupo Pecuario S.A.C. Los papeles, botellas, trapos o cualquier otro objeto utilizado, deberá ser depositado en los tachos que la empresa ha colocado para dicho fin.

Artículo 74°.- Todo el personal de la empresa está obligado a colaborar de forma activa con el aseo de los servicios higiénicos y los vestidores, así como a mantener estos ambientes en buen estado de conservación y limpieza.

Artículo 75°.- Grupo Pecuario S.A.C. no asume responsabilidad alguna por la pérdida o deterioro de cualquier objeto personal que los colaboradores traigan consigo al centro de labores.`,
  },
  {
    numero: 'XIII',
    titulo: 'NORMAS SOBRE PRIMEROS AUXILIOS EN CASO DE ACCIDENTES',
    texto: `Artículo 76°.- Cualquier colaborador que presencie o sufra un incidente o accidente durante su jornada de trabajo, deberá avisar inmediatamente al superior jerárquico, quien dará aviso a las autoridades pertinentes para atender dicho suceso (área de Gestión Humana, SSOMA o las Brigadas de primeros auxilios).

Artículo 77°.- En los casos de incidente o accidente de trabajo, por más leve que sea, el colaborador tiene la obligación de ponerlo de inmediato en conocimiento al área de SSOMA y Gestión Humana. De no ser así, corre el riesgo de no ser considerado como tal (accidente de trabajo) para los efectos de reconocimiento de Grupo Pecuario S.A.C. o de los seguros respectivos.

En caso de ser reportado como accidente de trabajo, el colaborador deberá llevar sus respectivos documentos de identificación. Si el colaborador no los tuviera en su poder en ese momento, el superior jerárquico deberá solicitar al área de Gestión Humana una carta de identificación, mostrando en ella la condición de colaborador de la empresa, y entregándosela para que éste pueda mostrarla a su vez, en el centro de salud en donde reciba atención médica.

Artículo 78°.- Grupo Pecuario S.A.C. asume las responsabilidades que la ley señala en los casos de accidente de trabajo. El superior jerárquico inmediato, así como el área de SSOMA, tiene dentro de sus funciones el velar por que se cumplan las disposiciones de seguridad establecidas en la empresa.`,
  },
  {
    numero: 'XIV',
    titulo: 'USO DE EQUIPOS DE CÓMPUTO, INTERNET Y CORREO ELECTRÓNICO',
    texto: `Artículo 79°.- La utilización de los equipos de cómputo de Grupo Pecuario S.A.C. está reservada a los colaboradores que hubieran sido designados y autorizados previamente. Está prohibido el uso de los equipos de cómputo, por parte de colaboradores no autorizados.

De haberse asignado una clave de acceso al sistema (software), esta no puede ser compartida con otro colaborador, salvo autorización expresa de la empresa.

Artículo 80°.- En caso de que Grupo Pecuario S.A.C. le proporcione al colaborador, el acceso a un terminal de cómputo u ordenador personal, este queda obligado a utilizar el mismo y sus equipos periféricos (impresoras, aparatos de escaneo, etc.) con fines exclusivamente laborales y para actividades relacionadas con los fines de la empresa, para la realización de tareas que le hubieran encomendado.

La utilización de dicho terminal o computadora para fines personales, sea de recreación, comunicación personal o de acceso a información que no esté relacionada con el cumplimiento de los fines de la empresa, requiere de permiso o autorización del superior jerárquico, y de ser necesario, será autorizado únicamente fuera de las horas de trabajo.

El incumplimiento de esta norma originará la aplicación de sanciones disciplinarias y, de acuerdo a la conducta del colaborador o el perjuicio ocasionado, podrá justificar el despido del colaborador.

Artículo 81°.- El equipo de cómputo que le proporciona Grupo Pecuario S.A.C. al colaborador, viene implementado con el software autorizado respectivo, el mismo que no podrá ser duplicado por el colaborador. El colaborador está prohibido de duplicar los archivos que se pudieran encontrar en la computadora o el sistema de Grupo Pecuario S.A.C.

Artículo 82°.- El empleador, en su calidad de propietario o titular del derecho de uso de los aparatos de cómputo que se encuentran en las instalaciones de Grupo Pecuario S.A.C., está facultado para inspeccionar su contenido directa o indirectamente, así como copiar integralmente la información que se encuentre dentro de los mismos, sin requerir para ello, autorización previa del colaborador.

Queda terminantemente prohibida la conexión a los sistemas de comunicación de Grupo Pecuario S.A.C., de cualquier aparato de cómputo de propiedad del colaborador, salvo que cuente con autorización expresa y escrita del empleador.

Asimismo, queda prohibido el retiro de información que se encuentre en los aparatos de cómputo de Grupo Pecuario S.A.C., a través de cualquier medio, directo o indirecto.

Artículo 83°.- El correo electrónico debe ser usado, prioritariamente, en el trabajo diario, para comunicarse internamente o externamente con clientes, asesores externos, proveedores y cualquier otro relacionado con la actividad de Grupo Pecuario S.A.C. Está terminantemente prohibido su uso para cursar mensajes con tendencias políticas, propaganda electoral, archivos o información obscena, mensajes en cadena, entre otros similares.`,
  },
  {
    numero: 'XV',
    titulo: 'EXÁMENES MÉDICOS',
    texto: `Artículo 84°.- Grupo Pecuario S.A.C., en coordinación con el área de SSOMA y en cumplimiento de sus deberes de seguridad y salud en el trabajo, programará la aplicación de los exámenes médicos, según se considere pertinente. Para ello, los colaboradores se encuentran obligados a someterse a los mismos, conforme a la normativa vigente y al Reglamento Interno de Seguridad y Salud en el Trabajo de la empresa.

Artículo 85°.- En caso de que alguno de los colaboradores contraiga enfermedad contagiosa, deberá dar aviso inmediatamente tanto al área de SSOMA, como al área de Gestión Humana, si fuera necesario.

Artículo 86°.- Los colaboradores están obligados a someterse a las evaluaciones y exámenes médicos que la empresa les solicite, con la finalidad de detectar el consumo de sustancias tóxicas, drogas, estupefacientes, alcohol, entre otros.

Artículo 87°.- Los colaboradores están obligados a someterse a las prácticas de profilaxis que, por medio de vacunas, sueros y otros medicamentos, ordenen las autoridades de Salud Pública o Grupo Pecuario S.A.C., con el objeto de prevenir enfermedades contagiosas o epidemias.`,
  },
  {
    numero: 'XVI',
    titulo: 'DERECHOS, OBLIGACIONES Y PROHIBICIONES DEL EMPLEADOR',
    texto: `Artículo 88°.- Son facultades de Grupo Pecuario S.A.C., además de las emitidas en el marco legal vigente, las siguientes:
a) Planear, organizar, integrar, dirigir y controlar las actividades en sus centros de trabajo.
b) Determinar las labores y responsabilidades que son asignadas a sus colaboradores, además de transferencias, rotaciones y reasignaciones ocupacionales para el mejor desarrollo de su fuerza laboral, con las únicas limitaciones de no ocasionar rebaja de salarios o categorías al personal por ese hecho.
c) Programar las jornadas, horarios y turnos de trabajo, de acuerdo con sus necesidades comerciales, administrativas y operativas.
d) Contratar y cesar personal, de conformidad con las normas legales laborales y las necesidades de Grupo Pecuario S.A.C.
e) Impartir instrucciones, señalar políticas y establecer disposiciones vinculadas a las labores, al desempeño y conducta de su personal en el centro de trabajo.
f) Introducir y aplicar nuevos métodos, procedimientos y sistemas que faciliten las operaciones y garanticen la competitividad.
g) Establecer y dictar las medidas de seguridad que considere adecuadas para garantizar la seguridad de su personal e instalaciones.
h) Vigilar y controlar sus inmuebles, bienes muebles, instalaciones y documentación de la manera que considere más conveniente.
i) Solicitar a los colaboradores la entrega de documentos o información que sea relevante, para los efectos de su labor en Grupo Pecuario S.A.C., tales como: currículum vitae, fotografías, certificados, constancias, etc.
j) Aplicar las sanciones al colaborador que correspondan, de acuerdo a lo establecido en este reglamento y la normatividad laboral vigente.
k) Conceder permisos y licencias a los colaboradores, de acuerdo a lo estipulado en este reglamento y la normatividad laboral vigente.

Artículo 89°.- Son obligaciones de Grupo Pecuario S.A.C., las siguientes:
a) Otorgar al colaborador un trato correcto y respetuoso de sus derechos.
b) Pagar al colaborador su remuneración y beneficios sociales en la forma, fecha, lugar y cantidad establecida por la empresa.
c) Velar porque se observe una conducta moral en la que no se realicen actos de hostigamiento sexual y otros de carácter deshonesto, que afecten la dignidad del colaborador.
d) Cumplir y hacer cumplir los dispositivos legales vigentes en el centro de trabajo.
e) Cumplir y hacer cumplir el presente Reglamento, el Reglamento Interno de Seguridad y Salud en el Trabajo así como el Código de Ética y demás procedimientos y disposiciones internas.
f) Capacitar e instruir a los colaboradores, según las posibilidades y necesidades de Grupo Pecuario S.A.C., tratando de mejorar las capacidades o habilidades de los mismos, con el propósito de aprovechar sus aptitudes, mejorar su rendimiento y sus posibilidades de desarrollo.
g) Determinar la política de remuneraciones y beneficios que corresponda al personal.
h) Programar las jornadas, turnos y horarios de trabajo que sean necesarios, en armonía con las disposiciones legales y los acuerdos contractuales.
i) Establecer y aplicar las medidas disciplinarias correspondientes, ante la comisión de faltas laborales en que pudiere incurrir el colaborador.
j) Fijar de manera unilateral la oportunidad de descanso vacacional, en caso no pueda fijarse de común acuerdo con el colaborador.
k) Supervisar y evaluar las labores de sus colaboradores, con el propósito de procurar que el trabajo sea realizado conforme a las necesidades de su puesto y a los valores que promueve Grupo Pecuario S.A.C.
l) Garantizar un ambiente de trabajo, libre de humo de tabaco.
m) Establecer medidas orientadas a identificar factores medioambientales que pudieran incrementar el riesgo de la transmisión de la Tuberculosis en el centro de labores, con la finalidad de erradicarlos.
n) Promover un ambiente de trabajo, en donde se sancione todo acto de discriminación, en cualquiera de sus modalidades.
o) Brindar charlas informativas de prevención de VIH – SIDA.
p) Adoptar las medidas que garanticen el apoyo y asistencia a sus colaboradores infectados o afectados a consecuencia del VIH y SIDA, a fin de evitar todo tipo de actos discriminatorios, a consecuencia de tal condición.
q) Brindar charlas informativas de prevención de Tuberculosis.
r) Adoptar las medidas que garanticen el apoyo y asistencia a sus colaboradores infectados o afectados a consecuencia de la Tuberculosis, a fin de evitar todo tipo de actos discriminatorios, a consecuencia de tal condición.

Artículo 90°.- Está prohibido en Grupo Pecuario S.A.C.:
a) Exigir directamente o a través de terceros vinculados económicamente a Grupo Pecuario S.A.C., que los colaboradores se realicen y/o exhiban sus resultados de la prueba del VIH.
b) Despedir sin justa causa comprobada o por su condición de VIH – SIDA, a los colaboradores, por lo que Grupo Pecuario S.A.C. deberá respetar los regímenes disciplinarios establecidos para tales efectos.
c) Efectuar o promover cualquier acto que vulnere o restrinja los derechos de los colaboradores o que ofenda su dignidad.
d) Efectuar o promover cualquier acto de discriminación, en contra de los colaboradores, por motivo de su creencia religiosa, ideas políticas, sexo, raza, o cualquier otro motivo que afecte su dignidad y condición de ser humano.`,
  },
  {
    numero: 'XVII',
    titulo: 'DERECHOS, OBLIGACIONES Y PROHIBICIONES DEL COLABORADOR',
    texto: `Artículo 91°.- Son derechos de los colaboradores, los siguientes:
a) Realizar sus labores en un ambiente designado por la empresa, que les permita desarrollar sus actividades laborales de forma adecuada.
b) Gozar de todos los derechos y beneficios previstos por la legislación vigente, además de aquellos que la empresa otorgue.
c) Percibir la remuneración y beneficios reconocidos por ley, además de aquellos que la empresa otorgue.
d) Recibir un trato cortés y respetuoso por parte de la empresa.
e) Ser escuchados y que se preste la debida atención a sus pedidos, sugerencias, reclamos y quejas, sean estas verbales o escritas, dentro del horario y las regulaciones que establezca la empresa.
f) El cumplimiento de las disposiciones contenidas en el presente reglamento y los demás dispositivos legales, procedimientos y disposiciones que la empresa establezca; así como lo establecido en la normatividad laboral vigente de nuestro país.
g) Exigir que la empresa adopte las medidas de seguridad necesarias, para la realización de todas las tareas que se le encomienden.
h) Que se mantenga en reserva, la información de carácter privado que hubiera proporcionado a la empresa.
i) Que su desempeño sea evaluado, periódicamente.
j) Participar en programas de capacitación, orientados a su desarrollo integral.
k) Exigir que sus labores puedan ser desarrolladas, en un ambiente libre de humo de tabaco.
l) Ser tratado con respeto y que se respeten sus ideas o creencias.
m) Exigir que Grupo Pecuario S.A.C., en su condición de empleador, cumpla con lo establecido en la normatividad laboral vigente de nuestro país.

Artículo 92°.- Son obligaciones de los colaboradores, las siguientes:
a) Cumplir las disposiciones de este Reglamento Interno, el Reglamento Interno de Seguridad y Salud en el Trabajo, el Código de Ética, así como las directivas que de acuerdo a la naturaleza del cargo y funciones le corresponda.
b) Prestar sus servicios con buena fe, poniendo el máximo de su habilidad y eficiencia en el desempeño de sus labores.
c) Conocer las características de sus labores, relacionadas cargo que ocupa y cumplir con honradez, lealtad y eficiencia las funciones y responsabilidades asignadas. Asimismo, deberán someterse a las evaluaciones que Grupo Pecuario S.A.C. disponga para verificar la idoneidad de los colaboradores en sus puestos y/o sus posibilidades de desarrollo.
d) Respetar el principio de autoridad y línea jerárquica establecido al interior de la empresa, así como desplegar un comportamiento adecuado en el trato con sus superiores y compañeros de trabajo, a fin de fomentar y mantener la armonía, respeto mutuo, orden y disciplina laboral en la empresa.
e) Tratar con cortesía y respeto a las personas que visiten las instalaciones de la empresa, así como a todas aquellas personas que, por motivo de la ejecución de sus labores, se relacionen con ellos.
f) Cuidar y mantener su centro de trabajo limpio, ordenado y en buen estado de conservación.
g) Mantener en todo momento, dentro y fuera del centro del trabajo, la más absoluta y estricta reserva sobre las actividades y operaciones empresariales en que hubiera intervenido o sobre la que haya tomado conocimiento. Igualmente, respetar la confidencialidad de la empresa, no pudiendo divulgar a terceros, ninguna información que se relacione con los clientes de Grupo Pecuario S.A.C.
h) No realizar ni promover operación alguna, con clientes o proveedores de Grupo Pecuario S.A.C. que le genere provecho a sí mismo o a terceros.
i) No realizar ni promover actividad alguna, que perjudique o se encuentre en conflicto con los intereses de la empresa.
j) Proteger y/o salvaguardar la imagen de Grupo Pecuario S.A.C. durante las actividades públicas.
k) Desempeñar sus funciones con responsabilidad, eficiencia y eficacia.
l) Comunicar de forma inmediata, al superior jerárquico, de los actos dolosos, irregulares o que denoten negligencia o imprudencia, cometidos por sus compañeros de trabajo, cualquiera sea su nivel jerárquico.
m) Comunicar de forma inmediata, al superior jerárquico, si observa que alguna persona se encuentra fumando y/o promoviendo el consumo de tabaco, en cualquiera de las instalaciones de la empresa.
n) Comunicar en forma inmediata a Grupo Pecuario S.A.C., los cambios de domicilio y las variaciones en las cargas de familia (nacimiento, fallecimiento, matrimonio, divorcio, etc.). Mientras el colaborador no comunique dichos hechos a Grupo Pecuario S.A.C., la empresa actuará válidamente con la información anterior a aquella que no fue proporcionada por el colaborador.
o) Verificar sus boletas de pago y suscribirlas al encontrarlas conforme.
p) Cumplir con los horarios puntuales, turnos y ciclos de trabajo, establecidos por Grupo Pecuario S.A.C., debiendo registrar individual y oportunamente su ingreso y su salida.
q) Evitar manifestar o difundir, por cualquier medio, expresiones atentatorias del buen nombre de Grupo Pecuario S.A.C. y/o que resquebrajen la armonía laboral.
r) No faltar a su centro de labores, sin causa debidamente justificada, ni efectuar registro de control de asistencia, retiro o ingreso, suplantando la identidad de otro colaborador.
s) No utilizar o disponer de materiales, útiles o bienes de Grupo Pecuario S.A.C., en perjuicio del empleador y/o en beneficio propio o de terceros.
t) No hacer ingresar a las instalaciones de Grupo Pecuario S.A.C., sin la debida autorización, a personas extrañas y mucho menos permitirles el manejo de equipos de oficina, maquinaria, aparatos o vehículos confiados al colaborador.
u) Ser responsable por las consecuencias de sus actos. El empleador no se responsabilizará por las obligaciones que tenga o adquiera el colaborador en forma personal, ante las autoridades civiles, judiciales, entidades administrativas públicas o privadas, entidades financieras, empresas, entre otros.
v) No participar como representante de Grupo Pecuario S.A.C. en reuniones, seminarios y similares, sin autorización expresa del empleador.
w) Cuidar y usar de manera adecuada los útiles de trabajo, mercadería, herramientas, instrumentos, equipos y demás que le proporcione la empresa para la realización de sus labores. La pérdida o deterioro injustificado de dichos bienes de propiedad de Grupo Pecuario S.A.C. o de aquellos que, sin ser propiedad del empleador, se encuentren bajo su custodia, será asumido por el colaborador.
x) Colaborar de forma activa con el aseo de su centro de labores, de los servicios higiénicos y de los vestidores, así como a mantener estos ambientes en buen estado de conservación y limpieza.
y) Presentarse en su lugar de trabajo correctamente vestido y guardar la debida compostura durante la jornada de trabajo, velando en todo momento por la buena imagen de Grupo Pecuario S.A.C.
z) Tratar respetuosamente y con cortesía a sus superiores, compañeros de trabajo y público en general. Por consiguiente, les está prohibido cualquier forma de trato que implique una falta de respeto, discriminación o que puedan perjudicar la buena imagen de Grupo Pecuario S.A.C.
aa) Prestar auxilio cuando se suscite un siniestro o se produzca un acontecimiento que ponga en peligro a quienes se encuentren dentro de las instalaciones de Grupo Pecuario S.A.C., peligrando los intereses de la empresa o la integridad de los compañeros de trabajo. El colaborador deberá reportar al superior jerárquico inmediato, todo accidente de trabajo, por leve que este sea.
bb) Acatar las medidas preventivas y de higiene que acuerden las autoridades competentes, así como aquellas que se indiquen para seguridad y protección personal de los colaboradores y de los lugares de trabajo.
cc) Estar en su puesto de trabajo a la hora señalada y no abandonarlo sin la correspondiente autorización.
dd) Avisar al superior jerárquico inmediato, de cualquier defecto que observe en los equipos que se le haya proporcionado.
ee) Reembolsar a Grupo Pecuario S.A.C. por cualquier daño o pérdida del EPP, materias primas, mercaderías, útiles, herramientas, máquinas u otros similares, que se genere por negligencia, imprudencia o desconocimiento del colaborador.
ff) Informar a los superiores jerárquicos, cuando estos soliciten información de los resultados de los trabajos que se le asignen.
gg) Realizar sus labores con diligencia y eficiencia, a fin de preservar los estándares de calidad que Grupo Pecuario S.A.C. ofrece y tiene la capacidad de brindar.
hh) Participar activamente en los programas de capacitación, cursos, charlas; proporcionados por la empresa así como seguir las políticas e indicaciones respectivas.
ii) Dar aviso inmediatamente al superior jerárquico inmediato, en caso de haber contraído enfermedad contagiosa.
jj) Cuidar los bienes de la empresa, procurando en todo momento la mayor eficiencia en su utilización.
kk) Entrar y salir del centro de trabajo, únicamente por la puerta designada para tal efecto, y permitir el registro personal y el registro de paquetes que introduzcan o saquen de la empresa.
ll) Cuando termine su vínculo laboral con la empresa, el colaborador tiene la obligación de devolver los documentos y el uniforme que le hubiere proporcionado la empresa; así como el equipo, herramientas, EPP, entre otros que se le hayan suministrado para el desempeño de sus labores. De no ser posible por haberlos extraviado o deteriorado injustificadamente, deberá reintegrar el valor económico de aquellos.
mm) Efectuar una adecuada y correcta comunicación con todos los integrantes de la empresa. Para ello, es importante ser sincero, honesto y responsable.
nn) Suscribir y cumplir con el convenio de confidencialidad.
oo) Cumplir las demás obligaciones que les impongan la legislación laboral vigente, el presente Reglamento Interno de Trabajo, el Reglamento Interno de Seguridad y Salud en el Trabajo, el Código de Ética y las directivas emitidas en la empresa, que de acuerdo a la naturaleza de su cargo y funciones, le corresponda.
pp) Cumplir las obligaciones y prohibiciones contenidas en el Decreto Legislativo N° 728 - Ley de Productividad y Competitividad Laboral, el Decreto Supremo N° 003-97-TR - Texto Único Ordenado del Decreto Legislativo N° 728 - o la norma que la sustituya, así como toda norma del ámbito laboral de nuestro país, cuya aplicación corresponda al caso en concreto.
qq) Reportar la cobranza ante la empresa, inmediatamente después de ser efectuada.
rr) Realizar el depósito de la cobranza, en las cuentas proporcionadas por la empresa, el mismo día de ser efectuada ésta.
ss) Desplegar una conducta responsable y preventiva, al momento de efectuar sus labores dentro y/o fuera de la empresa. Cualquier robo de sus pertenencias personales que sufriera el colaborador, será asumido por él mismo. La empresa podrá apoyar al colaborador y contribuir con el esclarecimiento de los hechos, pero no se hará responsable, ni asumirá la reposición o el costo económico de lo robado.
tt) Cumplir con la política y los procedimientos establecidos en el documento denominado: “Descripción de Puesto” y/o documentos de naturaleza similar que proporcione la empresa.

Artículo 93°.- El descuido u omisión en el cumplimiento de las obligaciones de trabajo, que ocasionen daño grave, como sabotaje a la producción, constituye falta grave que puede dar lugar al despido del colaborador.

Artículo 94°.- Queda expresamente prohibido a los colaboradores:
a) Faltar al trabajo o abandonarlo en horas de labor, sin causa que lo justifique o sin permiso de Grupo Pecuario S.A.C.
b) Dedicarse durante la jornada de trabajo, a atender asuntos personales u otros que no estén vinculados con la ejecución de las labores para las cuales han sido contratados.
c) Utilizar los ambientes y bienes de propiedad de Grupo Pecuario S.A.C. para realizar actividades ajenas a sus fines. Está prohibido introducir propaganda de cualquier naturaleza, realizar cualquier actividad de venta u otras que les generen beneficio propio o de terceros.
d) Hacer declaraciones o publicaciones referidas o relacionadas a Grupo Pecuario S.A.C., a través de los diversos medios de comunicación, salvo quienes cuenten con autorización expresa y por escrito, de la empresa.
e) Hacer valer su condición de colaborador de Grupo Pecuario S.A.C., para obtener ventajas de cualquier índole, respecto de terceros.
f) Alterar libros, registros, comprobantes o cualquier otro documento de la empresa.
g) Falsear información sobre sus datos personales (estado civil, derechohabientes, dirección de domicilio, entre otros) o de cualquier naturaleza, con intención de obtener beneficio de la empresa.
h) Realizar llamadas telefónicas personales o de larga distancia con cargo al número (o números) de Grupo Pecuario S.A.C., en beneficio propio o de terceros, sin autorización previa.
i) Ingresar en los departamentos, recintos o dependencias prohibidas por Grupo Pecuario S.A.C., en los cuales existe generalmente un aviso que dice “Se prohíbe la entrada”. Se exceptúa de esta prohibición a los colaboradores que desempeñan labores en dichos lugares y/o cuentan con autorización específica del superior jerárquico.
j) Permanecer en el centro de trabajo más de treinta (30) minutos, una vez culminado el horario de trabajo; salvo autorización expresa del superior jerárquico.
k) Disminuir intencionalmente el ritmo de ejecución del trabajo, suspender ilegalmente sus labores, promover suspensiones intempestivas de trabajo.
l) Desatender sus labores para atender otras actividades ajenas a sus funciones, las cuales están restringidas en la empresa.
m) Instalar y/o utilizar en las computadoras de Grupo Pecuario S.A.C., software que no cumpla los requisitos establecidos por la ley o no cuente con la licencia correspondiente.
n) Suministrar o mostrar a cualquier persona, ajena a Grupo Pecuario S.A.C., sin el consentimiento expreso y escrito de la empresa, los dibujos, diseños, planos, proyectos, información, datos de manufactura y otros afines, por ser procedimientos de fabricación, estrategias o técnicas consideradas secretas. Esta conducta es considerada como una falta grave.
o) Ingresar o salir del lugar o centro de trabajo, con paquetes, maletines, bolsas u otros similares, de propiedad de la empresa, sin estar expresamente autorizados por el superior jerárquico para ello.
p) Ingresar a la empresa, fuera del horario de trabajo, sin autorización expresa previa del superior jerárquico.
q) Portar o manipular cualquier clase de arma, dentro de las instalaciones de la empresa o durante el desempeño de sus labores.
r) Manejar, operar, conducir y/o retirar de las instalaciones de la empresa, equipos, máquinas, vehículos, que no les han sido asignados por ser ajenos al cargo o la función que desempeña; salvo autorización expresa previa del superior jerárquico correspondiente.
s) Fumar y/o promover el consumo de tabaco, en cualquiera de las instalaciones de la empresa, de conformidad con lo establecido en el Decreto Supremo N° 001-2011-SA.
t) Introducir o ingerir bebidas alcohólicas y/o cualquier tipo de sustancias tóxicas, drogas o estupefacientes, en los lugares y/o instalaciones de Grupo Pecuario S.A.C.
u) Dejar materiales inflamables o explosivos, fuera de los depósitos correspondientes o manipularlos con tal descuido que puedan ocasionar incendios, explosiones o cualquier siniestro.
v) Interrumpir la labor asignada, dormir durante las horas de trabajo y/o causar la interrupción de las labores de sus compañeros.
w) Utilizar los vehículos de la empresa, para transportar personas ajenas a la misma.
x) Presentarse a sus labores en estado de embriaguez o bajo los efectos de bebidas alcohólicas, sustancias tóxicas, drogas o estupefacientes.
y) Cometer dentro de las horas de trabajo, actos de indisciplina que puedan atentar contra la integridad de otros colaboradores, de los bienes o de la seguridad de Grupo Pecuario S.A.C.
z) Exigir o aceptar de los proveedores o clientes de Grupo Pecuario S.A.C., recompensas o dádivas de cualquier tipo. Esta conducta será considerada como falta grave, sin perjuicio de las responsabilidades civiles y/o penales, que ello pudiera generar para el colaborador.
aa) Crear o fomentar condiciones insalubres dentro de las instalaciones de la empresa, que puedan poner en peligro la vida o salud de sus compañeros o afectar los intereses de Grupo Pecuario S.A.C.
bb) Realizar o promover cualquier acto de discriminación, ya sea directa o indirectamente, por motivo de creencia religiosa, raza, sexo, condición socioeconómica, por ser portador de enfermedad contagiosa como VIH – SIDA o Tuberculosis. Esta conducta será considerada como falta grave, sin perjuicio de las responsabilidades civiles y/o penales, que ello pudiera generar para el colaborador.
cc) El uso de vocabulario grotesco, insultante, soez, peyorativo, dentro de las instalaciones de Grupo Pecuario S.A.C.
dd) Firmar el cargo de recepción de toda comunicación escrita, que le dirija la empresa, consignando en forma legible su nombre, su firma y la fecha.
ee) Realizar de cualquier forma o modalidad, cualquier tipo de acción que pueda ser considerada como acoso u hostigamiento. Esta conducta será considerada como falta grave, sin perjuicio de las responsabilidades civiles y/o penales, que ello pudiera generar para el colaborador.
ff) Prestar servicios simultáneos en favor de otras empresas, sobre todo aquellas que se dediquen al mismo rubro de Grupo Pecuario S.A.C., ni tampoco favorecer indebidamente, de cualquier manera, a los clientes o proveedores de Grupo Pecuario S.A.C.
gg) Apropiarse o perder el dinero recaudado por el colaborador, en la cobranza efectuada.
hh) Las demás prohibiciones que imponga la legislación laboral vigente, el presente Reglamento Interno, el Reglamento Interno de Seguridad y Salud en el Trabajo, el Código de Ética de Grupo Pecuario S.A.C. y las directivas que de acuerdo a la naturaleza del cargo y funciones, le corresponda acatar al colaborador.

Además de las prohibiciones señaladas en el presente reglamento, el colaborador cometerá falta grave cuando realice cualquiera de las conductas descritas en el artículo 25° del Decreto Supremo N° 003-97-TR -Texto Único Ordenado del Decreto Legislativo N° 728- o la norma que la sustituya, así como toda norma del ámbito laboral de nuestro país, cuya aplicación corresponda al caso en concreto.

Artículo 95°.- De modo general, también constituyen prohibiciones que deben ser acatadas y observadas estrictamente por los colaboradores de Grupo Pecuario S.A.C., los actos u omisiones que atenten contra el normal desenvolvimiento de las actividades de la empresa.

Artículo 96°.- Conforme a ley, los colaboradores son responsables por los perjuicios que causen a los intereses de Grupo Pecuario S.A.C., cuando procedan con dolo, negligencia o imprudencia comprobada, infringiendo normas, órdenes, directivas o instrucciones impartidas por la empresa.

Artículo 97°.- Todo colaborador deberá mantener en absoluta confidencialidad y secreto, los documentos, materiales y en general toda la información, a la que haya tenido acceso durante el vínculo laboral o a cuya elaboración hubiera contribuido directa o indirectamente o de los cuales tenga conocimiento por razones diversas, independientemente del medio o soporte que la contenga, así como de los asuntos administrativos cuya divulgación pudiera causar perjuicio alguno a Grupo Pecuario S.A.C., a sus clientes, a sus proveedores y/o terceros en general.

Artículo 98°.- Queda entendido que el compromiso a que se refiere el artículo anterior, es válido aún después de que el colaborador, por cualquier circunstancia, deje de formar parte de Grupo Pecuario S.A.C.; pudiendo la empresa tomar las acciones legales que correspondan, en salvaguarda de sus intereses.`,
  },
  {
    numero: 'XVIII',
    titulo: 'RÉGIMEN DISCIPLINARIO',
    texto: `Artículo 99°.- El incumplimiento de las obligaciones y la omisión de las prohibiciones señaladas en los artículos 93° y 94° respectivamente, será sancionado de acuerdo a la gravedad del hecho y/o al perjuicio ocasionado.

Artículo 100°.- Las sanciones disciplinarias que se aplican en la empresa, tienen por finalidad, que el colaborador rectifique su comportamiento; salvo en aquellos casos en que la falta cometida sea calificada como grave y la sanción fuese el despido.

Los superiores jerárquicos, deben estar en constante comunicación con los colaboradores a su cargo, a los cuales deben orientar y encaminar hacia la correcta actuación laboral y desarrollo personal, a fin de evitar que se produzcan actos de indisciplina que ameriten la aplicación de sanción.

Artículo 101°.- Durante la vigencia del vínculo laboral, Grupo Pecuario S.A.C. podrá aplicar las medidas disciplinarias que se establecen en el presente reglamento y aquellas que prevé la legislación laboral vigente. Para ello, antes de que se aplique al colaborador una sanción disciplinaria, la empresa deberá oír al inculpado directamente, quien tendrá un plazo razonable para ofrecer o exponer los descargos que estime pertinentes.

Artículo 102°.- El área de Gestión Humana, es la encargada de aplicar las sanciones disciplinarias que correspondan, a los colaboradores. Para ello, dicha área ejercerá esta función, aplicando criterios objetivos de razonabilidad y proporcionalidad, evidenciando coherencia entre los hechos evaluados, sus acciones y/o sus decisiones.

Artículo 103°.- Cuando se aplique una sanción disciplinaria, el colaborador está obligado a recibir y suscribir (consignando su firma y huella dactilar) el cargo de documentos que le sea entregado por la empresa, poniendo en su conocimiento la sanción disciplinaria que se le ha impuesto. En caso de negativa, la entrega del documento se hará por conducto notarial en el último domicilio que el colaborador hubiera señalado.

Artículo 104°.- Las sanciones disciplinarias que la empresa aplicará, serán las siguientes:
• Amonestación verbal.
• Memorándum de amonestación.
• Memorándum de sanción.
• Despido.

Las sanciones disciplinarias se aplicarán en función a la gravedad de la falta cometida, la categoría, la antigüedad y antecedentes disciplinarios del colaborador.

Artículo 105°.- El despido, como sanción disciplinaria más severa, consiste en la separación definitiva del colaborador, por haber cometido una falta grave, o por estar inmerso en cualquiera de las circunstancias establecidas en los artículos 23° y 24° del Decreto Supremo N° 003-97-TR - Texto Único Ordenado (TUO) de la Ley de Productividad y Competitividad Laboral.

Artículo 106°.- Además de lo estipulado en los artículos 93° y 94° del presente reglamento, el colaborador será sancionado disciplinariamente cuando cometa alguna falta que hubiera sido previamente publicada, impartida, difundida y/o estipulada por la empresa, a través del formato denominado “Memorándum Administrativo”. Esto se complementará con las directivas y/o documentos que en su oportunidad le proporcione la empresa, por motivo de la naturaleza del cargo o las funciones que le corresponda ejercer al colaborador.

Artículo 107°.- Para aplicar la sanción disciplinaria que se describe en el párrafo que antecede, Grupo Pecuario S.A.C. tomará en cuenta la gravedad de la falta cometida, el perjuicio que se hubiere ocasionado y los antecedentes del colaborador.

Artículo 108°.- En el ejercicio de su potestad disciplinaria, la empresa procederá conforme se establece en el presente reglamento, respetando en todo momento, lo establecido en la normatividad laboral vigente. El criterio que se utilizará para la aplicación de la sanción disciplinaria correspondiente, tendrá como referencia el momento en que el colaborador cometió la falta.`,
  },
  {
    numero: 'XIX',
    titulo: 'OTRAS DISPOSICIONES',
    texto: `Artículo 109°.- Grupo Pecuario S.A.C., de conformidad con lo establecido en el Decreto Supremo N° 001-2016-MIMP, implementa el servicio de lactario al interior de las instalaciones de la empresa, garantizando cumplir con los cánones de privacidad, comodidad, higiene y accesibilidad que exige la normatividad laboral vigente.

El lactario, es un ambiente privado de uso exclusivo de las madres que laboran en la empresa, para la extracción y conservación de la leche materna.

Artículo 110°.- Para poder hacer uso de este servicio de lactario, la madre trabajadora deberá registrarse previamente en el Área de Gestión Humana, a fin de que pueda gozar del permiso de la hora de lactancia, establecido en la normatividad laboral vigente.

Artículo 111°.- El tiempo de uso de lactario será de una (1) hora por cada jornada laboral, debiendo la colaboradora, cumplir con efectuar su registro previo en el Área de Gestión Humana. La frecuencia y oportunidad de uso del lactario, es determinada por la madre trabajadora, procurando no afectar en cada oportunidad, el correcto desempeño de sus labores.

Artículo 112°.- El Área de Gestión Humana de la empresa, será la encargada de orientar a las madres trabajadoras sobre el servicio de lactario. Asimismo, implementará un registro de usuarias del servicio y un registro de las asistencias respectivas. Grupo Pecuario S.A.C. respetará y aplicará los lineamientos señalados en el Decreto Supremo N° 001-2016-MIMP, en todo cuanto corresponda.

Artículo 113°.- En caso de que alguno de los colaboradores de la empresa resulte afectado por la Tuberculosis, Grupo Pecuario S.A.C., de conformidad con lo establecido en el Decreto Supremo N° 021-2016-SA, establece lo siguiente:

Artículo 114°.- Para poder acceder a los derechos y beneficios respectivos, el colaborador afectado por la Tuberculosis, deberá informar de tal situación al Área de Gestión Humana de la empresa.

Artículo 115°.- El Área de Gestión Humana de la empresa, una vez informada del diagnóstico del colaborador, mantendrá la reserva y discreción necesaria, para evitar que se produzcan en el ambiente laboral, actos discriminatorios de ningún tipo en contra del colaborador afectado.

Artículo 116°.- En caso de que Grupo Pecuario S.A.C. detecte que alguno de sus colaboradores ha sido afectado por la Tuberculosis, podrá derivarlo al establecimiento de salud más cercano a su domicilio.

Artículo 117°.- Al finalizar el descanso médico del colaborador afectado por Tuberculosis, Grupo Pecuario S.A.C. deberá solicitar al médico tratante un reporte de su estado de salud, el cual deberá informar que no contagia la Tuberculosis, además de señalar el tiempo que falta por cumplir su tratamiento y recomendar de ser el caso, que el colaborador sea reasignado a sus actividades laborales cuando se considere que las actividades que viene realizando, no afectarán su salud.

Artículo 118°.- En caso el médico tratante considere que las actividades laborales que realizaba el colaborador afectado por tuberculosis pudiesen afectar su estado de salud, éste podrá solicitar a Grupo Pecuario S.A.C. que se le reasignen labores o que lo reubiquen al interior de la empresa.

Artículo 119°.- El colaborador afectado por Tuberculosis, tiene derecho a ingresar una hora después del horario habitual a su lugar de trabajo o retirarse una hora antes, para recibir el tratamiento supervisado, hasta que culmine su tratamiento. El trabajador afectado con Tuberculosis, ejercerá este derecho coordinando con el médico tratante y lo comunicará oportunamente a Grupo Pecuario S.A.C.

Artículo 120°.- Grupo Pecuario S.A.C. respetará y aplicará los lineamientos señalados en el Decreto Supremo N° 021-2016-SA, en todo cuanto corresponda.

Artículo 121°.- Los equipos de oficina o herramientas no podrán ser extraídas del área a la que pertenecen y queda terminantemente prohibido, sacar equipos o herramientas de las instalaciones de la empresa, sin autorización expresa y escrita del Gerente General o de quien éste designe.

Artículo 122°.- Grupo Pecuario S.A.C., cuando lo estime conveniente, efectuará revisiones e inspecciones periódicas de los equipos o herramientas de trabajo que entregó a sus colaboradores y en caso de detectarse cualquier anomalía, deterioro injustificado o pérdida de dichos bienes, se aplicará una sanción disciplinaria, de acuerdo a la gravedad de la falta, el perjuicio ocasionado y los antecedentes personales del infractor. Para ello, el área de Gestión Humana ejercerá esta función, aplicando criterios objetivos de razonabilidad y proporcionalidad, evidenciando coherencia entre los hechos evaluados, sus acciones y/o sus decisiones.

Las sanciones podrán ser:
• Amonestación verbal.
• Memorándum de amonestación.
• Memorándum de sanción.
• Despido.

Artículo 123°.- Los materiales o piezas que deben ser usados en las labores administrativas o de producción, deberán ser inspeccionados por el colaborador antes de usarlos, y si resultase algún material o pieza defectuosa, tendrá la obligación comunicarlo al superior jerárquico.

Artículo 124°.- El material, piezas y/o equipos deberán guardarse siempre en el lugar designado por la empresa, para tal efecto.

Artículo 125°.- Cuando el colaborador observe que los trabajos que le han encomendado, no los puede desarrollar por falta de material o por cualquier otra causa, deberá comunicarlo al superior jerárquico.

Artículo 126°.- El colaborador es responsable por los daños ocasionados a los materiales, piezas o unidades, si se comprueba que tales daños se deben a su negligencia o imprudencia.

Artículo 127°.- Todas las órdenes que Grupo Pecuario S.A.C. imparta a través de sus representantes, serán respetadas y cumplidas por los colaboradores. Dichas órdenes se darán verbalmente o por escrito y el colaborador deberá estar atento y entender aquello que se le comunica, para no incurrir en falta por no haber prestado la debida atención.

Artículo 128°.- En los casos no previstos por este reglamento, se aplicarán las disposiciones vigentes de la normatividad laboral peruana.

Artículo 129°.- Grupo Pecuario S.A.C., en su afán de mantener buenas relaciones con sus colaboradores, efectuará reuniones de tipo informativo, cada cierto tiempo, para promover el cumplimiento del presente reglamento, las directivas y disposiciones internas de la empresa, así como las disposiciones vigentes de la normatividad laboral peruana.`,
  },
];
