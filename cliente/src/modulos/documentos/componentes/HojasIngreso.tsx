import type { ReactNode } from 'react';
import { fechaEnTexto } from '@/compartido/formato/montos';
import type { TipoIngreso } from '../dominio/documento';
import './hojasIngreso.css';

/**
 * Documentos de ingreso de Gestión Humana (los que se entregan a todo trabajador nuevo).
 * Texto y formato fieles a los modelos de la empresa: encabezado con código de formato,
 * logo, pie con la dirección y los mismos saltos de página. Se completan con la ficha del trabajador
 * y la fecha se llena cuando firma.
 */

export interface DatosIngreso {
  /** Nombre como en la ficha: "QUISPE ROJAS, JOSÉ". */
  nombre: string;
  dni: string;
  domicilio: string;
  /** Fecha de la firma (ISO). Sin firmar, se dejan los espacios en blanco como en el formato impreso. */
  fecha?: string;
}

interface Propiedades {
  tipo: TipoIngreso;
  datos: DatosIngreso;
  /** Marca de agua de la empresa (una por hoja). */
  marca: ReactNode;
  /** Firma del trabajador: la registrada, el recuadro para dibujarla o nada. */
  firma: ReactNode;
  /** Croquis de domicilio: capa sobre las cuadras (lienzo para dibujar o el croquis ya firmado). */
  croquis?: ReactNode;
  /** Croquis de domicilio: herramientas de dibujo mientras el trabajador firma. */
  herramientas?: ReactNode;
  /** Croquis de domicilio: referencias escritas por el trabajador (campo para escribir o el texto firmado). */
  referencias?: ReactNode;
}

/** Código, fecha y versión de los formatos de Gestión Humana. */
const FORMATOS: Partial<Record<TipoIngreso, { codigo: string; fecha: string; version: string }>> = {
  croquis: { codigo: 'GC-RH-F006', fecha: '16.11.2014', version: '01' },
  antecedentes: { codigo: 'GC-RH-F007', fecha: '16.05.2014', version: '01' },
  induccion: { codigo: 'GC-RH-F009', fecha: '01.10.25', version: '01' },
};

/** Pie de página con la dirección de la empresa (los datos de contacto reales van en .env.local). */
export const PIE_DOCUMENTOS = import.meta.env.VITE_PIE_DOCUMENTOS ?? 'Av. Canto Bello 177 Urb. Canto Bello Lima 36 – rrhh@grupopecuario.pe';

/** "QUISPE ROJAS, JOSÉ" → "Quispe Rojas José" (apellidos primero, como en los documentos de la empresa). */
const nombreDocumento = (nombre: string) =>
  nombre
    .replace(',', '')
    .toLowerCase()
    .replace(/(^|\s)(\p{L})/gu, (_, espacio: string, letra: string) => espacio + letra.toUpperCase());

/** "Lima, 07 de Octubre de 2024", o los puntos para completar si aún no firma. */
const lugarYFecha = (fecha?: string, cierre = 'de 202…') => (fecha ? `Lima, ${fechaEnTexto(fecha)}` : `Lima, ………. de ……………………… ${cierre}`);

/* ---------- Piezas comunes ---------- */

function Hoja({ marca, children, pie, pagina, total, clase = '' }: { marca: ReactNode; children: ReactNode; pie?: boolean; pagina?: number; total?: number; clase?: string }) {
  return (
    <article className={`doc-hoja doc-legal ing-hoja ${clase}`}>
      {marca}
      <div className="ing-hoja__cuerpo">{children}</div>
      {pie && (
        <footer className="ing-pie">
          <span />
          {PIE_DOCUMENTOS}
        </footer>
      )}
      {total && total > 1 && <span className="ing-numero">{pagina}</span>}
    </article>
  );
}

/** Encabezado de los formatos: logo | título | código, fecha, versión y página. */
function EncabezadoFormato({ tipo, titulo }: { tipo: TipoIngreso; titulo: ReactNode }) {
  const f = FORMATOS[tipo]!;
  return (
    <table className="ing-formato">
      <tbody>
        <tr>
          <td className="ing-formato__logo" rowSpan={4}>
            <img src="/logo-boleta.png" alt="Grupo Pecuario" />
          </td>
          <td className="ing-formato__titulo" rowSpan={4}>
            {titulo}
          </td>
          <td>Código: {f.codigo}</td>
        </tr>
        <tr>
          <td>Fecha: {f.fecha}</td>
        </tr>
        <tr>
          <td>Versión: {f.version}</td>
        </tr>
        <tr>
          <td>Página: 1 de 1</td>
        </tr>
      </tbody>
    </table>
  );
}

function Logo() {
  return <img className="ing-logo" src="/logo-boleta.png" alt="Grupo Pecuario" />;
}

/** Línea de firma con lo que se escribe debajo. */
function Firma({ firma, children, clase = '' }: { firma: ReactNode; children: ReactNode; clase?: string }) {
  return (
    <div className={`ing-firma ${clase}`}>
      <div className="ing-firma__espacio">{firma}</div>
      <span className="ing-firma__linea" />
      {children}
    </div>
  );
}

/* En la plataforma la huella no procede: el trabajador firma digitalmente, como en el contrato. */

/** Constancia de recepción al final de los documentos que en el modelo no traen firma. */
function Recepcion({ datos, firma, documento }: { datos: DatosIngreso; firma: ReactNode; documento: string }) {
  return (
    <section className="ing-recepcion">
      <p>
        Declaro haber recibido, leído y comprendido {documento} de GRUPO PECUARIO S.A.C., y me comprometo a cumplirlo.
      </p>
      <p>{lugarYFecha(datos.fecha)}</p>
      <Firma firma={firma} clase="es-centrada">
        <strong>{nombreDocumento(datos.nombre)}</strong>
        <span>DNI Nº {datos.dni}</span>
      </Firma>
    </section>
  );
}

/* ---------- Inducción al personal nuevo (GC-RH-F009) ---------- */
function Induccion({ datos, marca, firma }: Omit<Propiedades, 'tipo'>) {
  return (
    <Hoja marca={marca} clase="es-grande">
      <EncabezadoFormato tipo="induccion" titulo={<span className="es-normal">INDUCCIÓN AL PERSONAL NUEVO</span>} />
      <p>Por medio del presente documento doy constancia de haber recibido la inducción por parte del área de Gestión Humana.</p>
      <p>Durante la inducción se abordaron los siguientes temas:</p>
      <ul className="ing-vinetas">
        <li>Misión y visión institucional.</li>
        <li>Valores corporativos de la empresa.</li>
        <li>Modalidad y forma de pago.</li>
        <li>Horarios de trabajo y puntualidad.</li>
        <li>Registro de marcación de ingreso y salida.</li>
        <li>Procedimiento para la presentación de descansos médicos.</li>
        <li>Proceso de reporte en caso de inasistencias, tardanzas o solicitud de permisos.</li>
        <li>Política de hostigamiento Sexual, uso de celular y vestimenta,</li>
        <li>Beneficios sociales ( Vida Ley, vacaciones, CTS, gratificación, etc)</li>
      </ul>
      <p>Manifiesto haber comprendido toda la información brindada, y me comprometo a cumplir con las políticas, procedimientos y valores establecidos por la organización.</p>
      <div className="ing-campos">
        <strong>Apellidos y Nombres:</strong>
        <span className="ing-campo ing-campo--ancho">{nombreDocumento(datos.nombre)}</span>
        <div className="ing-campo-fila">
          <strong>DNI:</strong>
          <span className="ing-campo">{datos.dni}</span>
        </div>
        <div className="ing-campo-fila">
          <strong>Fecha:</strong>
          <span className="ing-campo">{datos.fecha ? fechaEnTexto(datos.fecha) : ''}</span>
        </div>
      </div>
      <div className="ing-firma-huella">
        <Firma firma={firma}>
          <strong>Firma</strong>
        </Firma>
      </div>
    </Hoja>
  );
}

/* ---------- Acuerdo de confidencialidad ---------- */
function Confidencialidad({ datos, marca, firma }: Omit<Propiedades, 'tipo'>) {
  return (
    <Hoja marca={marca} pie>
      <Logo />
      <h3 className="ing-titulo-subrayado">ACUERDO DE CONFIDENCIALIDAD</h3>
      <p>
        Por el presente, yo <strong>{nombreDocumento(datos.nombre)}</strong>, identificado con DNI Nº <strong>{datos.dni}</strong>, debido a que presto servicios en la empresa
        GRUPO PECUARIO S.A.C., me comprometo, bajo juramento a:
      </p>
      <ol className="ing-numerada">
        <li>Sujetarme a las normativas y las disposiciones establecidas en el Reglamento Interno de Trabajo de la empresa.</li>
        <li>
          Comunicar al superior jerárquico, sobre cualquier incompatibilidad que pueda afectar mi labor en términos de calidad, objetividad, eficiencia, credibilidad, entre otros, con
          la finalidad de que se determine la acción a tomar, para asegurar el ejercicio de mis servicios en forma transparente, libre de conflictos de intereses, prohibiciones,
          impedimentos o situaciones que pudieran dar motivo a que otros cuestionen mi independencia y la calidad de mi trabajo.
        </li>
        <li>
          Guardar reserva sobre la información privilegiada que conociera en el ejercicio de mis servicios, para ello, me obligo a no revelar de forma alguna, verbal o escrita, ni
          por cualquier medio electrónico, hechos, datos, información, procedimientos y documentación de tipo legal, económico, financiero, técnico, comercial, estratégico o de
          cualquier otra naturaleza, de conocimiento común o de acceso restringido (secreto, reservado y/o confidencial) fuera o dentro de la empresa. La información que aquí
          conociera, será utilizada única y exclusivamente para el desarrollo de mis funciones, comprometiéndome a no utilizar dicha información para fines distintos al propósito
          antes mencionado. Esta obligación de confidencialidad será de carácter indefinido y se extiende incluso hasta después de cesar en mis servicios como prestador de servicios.
        </li>
      </ol>
      <p className="ing-lugar">{lugarYFecha(datos.fecha)}</p>
      <Firma firma={firma} clase="es-centrada">
        <strong>{nombreDocumento(datos.nombre)}</strong>
        <strong>DNI Nº {datos.dni}</strong>
      </Firma>
    </Hoja>
  );
}

/* ---------- Código de Ética (5 páginas) ---------- */
function Etica({ datos, marca, firma }: Omit<Propiedades, 'tipo'>) {
  const total = 5;
  const T = ({ n, children }: { n: string; children: ReactNode }) => (
    <h5 className="ing-sub">
      <span>{n}</span>
      <u>{children}</u>
    </h5>
  );
  return (
    <>
      <Hoja marca={marca} pagina={1} total={total} clase="es-compacta">
        <h3 className="ing-titulo-subrayado">CÓDIGO DE ÉTICA</h3>
        <h4 className="ing-seccion">
          1. <u>ANTECEDENTES</u>:
        </h4>
        <div className="ing-sangria">
          <p>
            La organización Grupo Pecuario S.A.C., promueve una cultura sustentada en valores permanentemente. Esos valores, a la vez, inspiran un código de ética al que se debe
            adherir todo su personal y que debe normar sus relaciones con la comunidad, los clientes, los proveedores y con sus compañeros al interior de la organización.
          </p>
          <p>Los valores de Grupo Pecuario, son:</p>
          <ul className="ing-cuadrados">
            <li>Integridad</li>
            <li>Equidad</li>
            <li>Vocación de servicio</li>
            <li>Excelencia e innovación</li>
            <li>Respeto a la persona</li>
            <li>Trabajo en equipo</li>
            <li>Compromiso</li>
          </ul>
        </div>
        <h4 className="ing-seccion">
          2. <u>NORMAS DE CONDUCTA</u>:
        </h4>
        <div className="ing-sangria">
          <p>
            Todos los que trabajan en la empresa Grupo Pecuario S.A.C., independientemente del cargo que ocupan, deben cumplir las normas de conducta expresadas en este Código. El
            solo hecho de aceptar trabajar para la organización, obliga al personal a este cumplimiento, motivo por el cual, se adhieren a lo establecido en el presente Código de
            Ética.
          </p>
          <h5 className="ing-sub">
            <span>2.1</span>
            <u>Normas de conducta con la comunidad</u>
          </h5>
          <T n="2.1.1">Cumplimiento de las leyes y regulaciones</T>
          <div className="ing-sangria-2">
            <p>
              El personal de Grupo Pecuario S.A.C., se compromete cumplir con todas las leyes y regulaciones que le son aplicables. Por lo tanto, debe cuidar de informarse de las
              disposiciones que la compañía debe cumplir y evitar cualquier conducta que pudiera ser interpretada como contraria a las leyes y/o disposiciones de cualquier
              jurisdicción en la que la empresa realice sus actividades.
            </p>
          </div>
          <T n="2.1.2">Salud, seguridad y medio ambiente en el trabajo</T>
          <div className="ing-sangria-2">
            <p>
              El personal de Grupo Pecuario S.A.C. se compromete a proteger y promover la salud, seguridad y medio ambiente en el trabajo. Es responsable de mantener un lugar de
              trabajo seguro y saludable, para lo cual Grupo Pecuario S.A.C. pone a su disposición los equipos e implementos necesarios para desarrollar adecuadamente y sin riesgo las
              funciones que se les encargue. No se admitirán acciones o amenazas que alteren el buen funcionamiento de la empresa o pongan en riesgo la salud y seguridad del personal
              o visitantes en cualquiera de los locales en donde se llevan a cabo actividades de la organización. Es también responsable de reportar de forma inmediata a las personas
              designadas por la empresa, de cualquier incidente y accidente, así como de la existencia de equipos, prácticas o condiciones inseguras. En todo caso, la seguridad tendrá
              prioridad sobre cualquier actividad donde se presente una situación de conflicto.
            </p>
            <p>
              Asimismo, el personal acepta que la empresa pueda inspeccionar, en cualquier momento y sin requerimiento previo, cualquier bien de su propiedad que los colaboradores
              utilicen para guardar sus efectos personales, lo cual incluye escritorios, casilleros, vehículos, etc.
            </p>
          </div>
        </div>
      </Hoja>

      <Hoja marca={marca} pagina={2} total={total} clase="es-compacta">
        <div className="ing-sangria">
          <T n="2.1.3.">Responsabilidad social</T>
          <div className="ing-sangria-2">
            <p>
              El personal de Grupo Pecuario S.A.C. debe ser consciente y reconocer a la comunidad, gobierno y medio ambiente que los rodea, en el cual desempeña su actividad
              comercial; buscando que el desarrollo de su actividad no perjudique a ninguno de ellos. Por el contrario, busque contribuir en lo que pueda dentro de su ámbito de
              operación.
            </p>
            <p>
              Por ello, estará sujeto a las normativas o disposiciones que se decreten en son de salvaguardar la armonía y el cuidado del medio ambiente, fomentando eventos de
              concientización o ejecutando proyectos para que la actividad de Grupo Pecuario S.A.C. no cause daños o en éste.
            </p>
            <p>
              Todo el equipo de Grupo Pecuario S.A.C, se verá comprometido a realizar las actividades que la empresa desarrolle, con la finalidad de lograr un compromiso o
              responsabilidad social (reciclaje, cuidado de calles y áreas verdes, entre otros)
            </p>
          </div>
          <h5 className="ing-sub">
            <span>2.2</span>
            <u>Normas de conducta con la organización</u>
          </h5>
          <T n="2.2.1.">Cumplimiento de los objetivos de la empresa</T>
          <div className="ing-sangria-2">
            <p>El personal de Grupo Pecuario S.A.C., ratifica su compromiso de trasformar los objetivos de la empresa en objetivos personales e individuales.</p>
            <p>
              El personal está convencido de que sus propios objetivos tendrán importancia, en la medida en que contribuyan al logro de los objetivos generales de la empresa, y sus
              funciones dentro de su área, girará en torno a esta iniciativa.
            </p>
          </div>
          <T n="2.2.2.">Conflicto de interés</T>
          <div className="ing-sangria-2">
            <p>
              El personal de Grupo Pecuario S.A.C. actuará con lealtad, independencia, transparencia, imparcialidad y un alto contenido ético en el desempeño de sus actividades en la
              organización, evitando que se produzcan conflictos reales o aparentes entre sus propios intereses y los de la empresa. Existe conflicto cuando el colaborador tiene
              interés propio o representa intereses de terceros relacionados, que pueden interferir o ser contrarios a los intereses de la organización, o que influyan sobre la
              independencia de sus decisiones, o que lo lleven a actuar de manera parcializada y no objetiva, en perjuicio de Grupo Pecuario S.A.C.
            </p>
            <p>
              El personal no participará en negocios con el nombre de Grupo Pecuario S.A.C., como un independiente, ni prestará servicios de consultoría, ni desempeñará cargos de
              director, ejecutivo o empleado de un proveedor, cliente o competidor, salvo autorización por escrito del Gerente General. El colaborador no participará en actividades
              personales que pudieran distraer el tiempo que deba dedicarle al trabajo, o que impidan una dedicación exclusiva a la empresa, aun tratándose de actividades educativas
              o a las que deba brindarle atención tal que le impida cumplir con sus obligaciones laborales y/o compita con los intereses de la organización, salvo autorización por
              escrito del Gerente General.
            </p>
          </div>
          <T n="2.2.3.">Deber de lealtad y diligencia</T>
          <div className="ing-sangria-2">
            <p>
              El personal de Grupo Pecuario S.A.C. realiza su trabajo con lealtad a la empresa y cumple su función con la debida diligencia, poniendo su máximo empeño y atención; sin
              buscar un beneficio con la utilización de la información que maneja.
            </p>
          </div>
        </div>
      </Hoja>

      <Hoja marca={marca} pagina={3} total={total} clase="es-compacta">
        <div className="ing-sangria">
          <div className="ing-sangria-2">
            <p>
              Bajo ninguna circunstancia, el personal de Grupo Pecuario S.A.C, debe transmitir información a terceros (competencia, clientes, personas ajenas a la empresa, entre
              otros), sobre todo información o procedimientos exclusivos, los cuales se manejan estrictamente para la subsistencia de la empresa, tales como datos de precios,
              estrategias comerciales, procedimientos legales y bancarios, o ya sean datos de la planilla o documentos legales de los colaboradores, entre otros que sean de uso
              interno y que son manejados de forma leal y manteniendo la diligencia del caso.
            </p>
          </div>
          <T n="2.2.4.">Ventas, marketing y adecuado manejo de los negocios</T>
          <div className="ing-sangria-2">
            <p>
              El personal de Grupo Pecuario S.A.C. actuará de conformidad con los estándares más altos de integridad, en todos los aspectos de la organización, realizándolas de
              manera honesta y equitativa; no transmitirá mensajes deliberadamente engañosos ni omitirá hechos importantes, ni hará falsas afirmaciones sobre las ofertas de nuestros
              competidores. No atribuirá características distintas a los productos que comercializa, debiendo conducir los negocios en forma transparente y dentro del marco de la
              legalidad.
            </p>
            <p>
              El personal de Grupo Pecuario S.A.C. se abstendrá de proporcionar información a medios de comunicación, con excepción de aquellas circunstancias en las que haya una
              indicación expresa de Gerencia General.
            </p>
          </div>
          <T n="2.2.5.">Manejo de la información confidencial</T>
          <div className="ing-sangria-2">
            <p>
              La información confidencial es un bien valioso que podría beneficiar a un determinado inversionista o a un competidor si la llegara a conocer, perjudicando a la
              organización si ésta se hiciera pública. Por ello, el personal de Grupo Pecuario S.A.C. no revelará información relacionada con asuntos confidenciales a personas no
              autorizadas dentro o fuera de la organización, salvo que se cuente con la autorización correspondiente.
            </p>
            <p>
              De igual forma, la información confidencial obtenida de clientes, proveedores y otros en general, en el curso de las actividades, será mantenida en reserva como si
              fuese propia y se compromete a abstenerse de utilizar dicha información, a título personal, transando la información privilegiada en pro de beneficios personales o de
              terceros con los cuales podría tener contacto.
            </p>
          </div>
          <T n="2.2.6.">Uso adecuado de los activos de la organización y de la información en general</T>
          <div className="ing-sangria-2">
            <p>
              Los activos de la compañía, sean tangibles o intangibles, así como la documentación e información de la misma, son propiedades valiosas de la compañía.
            </p>
            <p>
              El personal usará los activos de la compañía solo para los negocios de ésta y exclusivamente en el desempeño de sus funciones. La compañía promueve el uso racional,
              consciente y adecuado de los activos, sin despilfarros, ni derroches. Entiende que está prohibido el uso personal o no autorizado de los activos de la empresa, como por
              ejemplo: locales, vehículos, computadoras, impresoras, fotocopiadoras, electrodomésticos, apiladores, estockas, bienes muebles, teléfonos, manuales, útiles de oficina y
              otros.
            </p>
            <p>
              El personal de Grupo Pecuario S.A.C. no podrá hacer uso en beneficio propio o de terceros relacionados, de los bienes de la empresa antes mencionados a menos que reciba
              autorización de Gerencia General.
            </p>
          </div>
        </div>
      </Hoja>

      <Hoja marca={marca} pagina={4} total={total} clase="es-compacta">
        <div className="ing-sangria">
          <div className="ing-sangria-2">
            <p>
              De igual manera, el personal de Grupo Pecuario S.A.C. no podrá utilizar información de la organización para fines personales, aun cuando ésta no fuese confidencial o
              esté destinada a fines no lucrativos o educativos (material para el dictado de cursos, tesis, trabajos de investigación, etc.), salvo autorización escrita del Gerente
              General. Dicha información solo podrá ser proporcionada o por el Gerente General o quien éste lo designe.
            </p>
          </div>
          <T n="2.2.7.">Uso de correo electrónico e internet</T>
          <div className="ing-sangria-2">
            <p>
              El personal de Grupo Pecuario S.A.C. hará un buen uso del correo electrónico, conduciéndose con propiedad y a la altura de los estándares de seriedad, profesionalismo y
              respeto que promueve la organización.
            </p>
            <p>
              El personal comprende que está prohibido el uso del correo electrónico e internet para actividades y usos personales distintos a los negocios o las actividades propias
              de la organización, siendo consciente que se ponen estos a su disposición exclusiva como herramientas de trabajo. En tal sentido, autoriza expresamente a la
              organización, para acceder a dicha información para verificar su buen uso, renunciando en forma expresa a cualquier reclamo posterior.
            </p>
          </div>
          <T n="2.2.8.">Conducta fraudulenta o deshonesta</T>
          <div className="ing-sangria-2">
            <p>
              Los intereses de la organización nunca se verán favorecidos por la conducta fraudulenta o ilegal de sus empleados. El personal de Grupo Pecuario S.A.C. tratará de manera
              justa y honesta a todas las personas con las que la organización realiza negocios (clientes y proveedores) y así mantendrá su reputación e integridad en todas sus
              relaciones comerciales. Bajo ninguna circunstancia se ofrecerá información falsa, ficticia, fraudulenta o engañosa.
            </p>
          </div>
          <T n="2.2.9.">Igualdad de oportunidades y trato no discriminatorio</T>
          <div className="ing-sangria-2">
            <p>Es política de la organización, brindar igualdad de oportunidades a todo su personal, siendo un factor determinante su propio esfuerzo y desarrollo individual.</p>
            <p>
              La organización no tolera ningún tipo de trato discriminatorio o acoso. La conducta abusiva, hostil u ofensiva es inaceptable, sea esta verbal, física o visual. Algunos
              ejemplos incluyen comentarios despectivos en base a características raciales o étnicas, creencias, ideas, posiciones políticas o religiosas, preferencias sexuales,
              etc. El personal de Grupo Pecuario S.A.C. se compromete a propiciar un clima de respeto común en el que se erradiquen estas manifestaciones y a reportar el
              hostigamiento si ocurriera.
            </p>
          </div>
          <h5 className="ing-sub">
            <span>2.3.</span>
            <u>Normas de conducta de terceros</u>
          </h5>
          <T n="2.3.1.">Relaciones con clientes</T>
          <div className="ing-sangria-2">
            <p>
              El personal de Grupo Pecuario S.A.C. busca relaciones comerciales de largo plazo con sus clientes, basadas en la excelencia del servicio y la venta de productos de
              calidad.
            </p>
            <p>
              Todos los negocios se llevarán a cabo dentro del marco de seriedad, equidad y transparencia que postula la empresa, encontrándose el trabajador impedido de obtener
              información de terceros sin consentimiento del cliente o de inducir, presionar o incentivar a funcionarios o empleados del cliente para revelar información considerada
              confidencial en provecho propio o de la organización.
            </p>
          </div>
        </div>
      </Hoja>

      <Hoja marca={marca} pagina={5} total={total} clase="es-compacta">
        <div className="ing-sangria">
          <div className="ing-sangria-2">
            <p>
              En el desempeño de sus actividades, el personal de Grupo Pecuario S.A.C. no debe esperar ningún tipo de retribución especial de parte de nuestros clientes y
              proveedores, por lo que no se aceptarán regalos, favores o invitaciones de parte de cualquiera de ellos, que trasciendan el concepto de cortesía, ni dinero bajo ningún
              concepto, salvo autorización por escrito del Gerente General.
            </p>
          </div>
          <T n="2.3.2.">Relaciones con los proveedores</T>
          <div className="ing-sangria-2">
            <p>
              Las decisiones de compra deberán tomarse basadas solamente en los mejores intereses de la organización, bajo condiciones de apertura y libre competencia. Los
              proveedores obtendrán la preferencia de la empresa, en base a la calidad del producto o servicio que ofrecen, así como de su precio y términos de entrega. Es política
              de la organización, crear relaciones confiables y justas con sus proveedores, bajo una perspectiva de crecimiento mutuo. El personal de Grupo Pecuario S.A.C. se
              compromete a no aceptar regalos, favores, invitaciones, comisiones, honorarios o ingresos de cualquier tipo, sea en dinero o en especie de parte de cualquier proveedor,
              salvo autorización por escrito Gerente General.
            </p>
          </div>
          <T n="2.3.3.">Asuntos relacionados con la competencia y competencia.</T>
          <div className="ing-sangria-2">
            <p>
              El personal de Grupo Pecuario S.A.C. se identifica con los principios constitucionales del libre mercado. Cree en la libre competencia y en la captación y retención de
              los clientes a través de la oferta de productos y servicios de calidad, compitiendo de una manera justa, leal y transparente, bajo criterios de eficiencia y una esmerada
              atención de los requerimientos y necesidades de los clientes.
            </p>
            <p>
              El personal de Grupo Pecuario S.A.C, no entregará a terceras personas, información sobre productos y negocios de la organización, en particular a aquellas con las cuales
              compite en los diferentes sectores en los que ésta actúa.
            </p>
          </div>
        </div>
        <h4 className="ing-seccion">
          3. <u>SANCIONES</u>
        </h4>
        <div className="ing-sangria">
          <p>
            El personal de Grupo Pecuario S.A.C. acepta el principio de que la empresa, para el correcto desempeño de sus funciones, debe establecer reglamentos, normas y
            procedimientos cuyo contenido declara conocer y a cuyo pleno cumplimiento, se somete.
          </p>
          <ul className="ing-vinetas es-pegada">
            <li>
              Es de conocimiento del personal de Grupo Pecuario S.A.C., que la empresa pueda aplicar medidas disciplinarias (Amonestación verbal, Memorándum de amonestación,
              Memorándum de sanción y/o Despido) y sancionar a los trabajadores que incumplan las normas de conducta señaladas en este código, incluyendo su posible separación, de
              acuerdo a las disposiciones legales vigentes.
            </li>
          </ul>
          <p>
            Asimismo, dependiendo de la gravedad del daño ocasionado a Grupo Pecuario S.A.C., la organización se reserva el derecho de tomar las acciones legales que correspondan, ante
            las instancias pertinentes, en caso de ser necesarias para los intereses de la empresa.
          </p>
          <p>
            El personal de Grupo Pecuario S.A.C. deberá reportar a la brevedad posible, de cualquier evento, situación o conducta inapropiada o contraria a lo dispuesto en esta norma,
            siendo el encargado de otorgar las autorizaciones que se hace referencia este documento.
          </p>
        </div>
        <Recepcion datos={datos} firma={firma} documento="el presente Código de Ética" />
      </Hoja>
    </>
  );
}

/* ---------- Política de uso de celulares personales (2 páginas) ---------- */
function Celulares({ datos, marca, firma }: Omit<Propiedades, 'tipo'>) {
  return (
    <>
      <Hoja marca={marca} pagina={1} total={2}>
        <h3 className="ing-titulo-doble">
          POLITICA DE USO DE CELULARES PERSONALES
          <br />
          GRUPO PECUARIO S.A.C.
        </h3>
        <h4>ALCANCE:</h4>
        <p>En las instalaciones de Grupo Pecuario.</p>
        <h4>OBJETIVO:</h4>
        <ul className="ing-vinetas es-pegada">
          <li>Establecer los lineamientos para el uso de equipos electrónicos y de comunicación en la empresa.</li>
          <li>Garantizar la seguridad de los colaboradores, previniendo accidentes por el uso de estos equipos en el horario de trabajo.</li>
        </ul>
        <h4>RESPONSABLES:</h4>
        <ul className="ing-vinetas es-pegada">
          <li>
            <strong>Gerencia General</strong>: Brindar los recursos para el cumplimiento de la siguiente política.
          </li>
          <li>
            <strong>Departamento de Gestión Humana:</strong> Establecer los lineamientos para el cumplimiento de la política.
          </li>
          <li>
            <strong>Jefes de área:</strong> Asegurar el cumplimiento de la presente política.
          </li>
          <li>
            <strong>Área Seguridad y Prevención</strong>: De la coordinación de revisión, acceso y custodia de los equipos de comunicación y electrónicos.
          </li>
          <li>
            <strong>Colaboradores:</strong> Cumplir lo establecido en la política.
          </li>
        </ul>
        <h4>CONSIDERACIONES:</h4>
        <ol className="ing-numerada es-pegada">
          <li>
            Está prohibido ingresar a las instalaciones de Grupo Pecuario equipos de comunicación y cualquier equipo electrónico. Se exceptúa de esta política a los colaboradores que
            por la naturaleza de sus funciones tengan la necesidad de hacer uso de equipos celulares, entregados por la empresa o uso de equipos personales.
          </li>
          <li>El personal que esté autorizado para ingresar con celulares personales y/o corporativos, siempre debe contar con una autorización y el uso será limitado.</li>
          <li>
            Los equipos de comunicación y electrónicos que están prohibidos su ingreso son: celulares, cámara fotográfica, cámara de video, tablet, USB, memorias portátiles, grabadora
            de voz, radios, MP3, MP4, IPOD, etc.
          </li>
          <li>
            Todo colaborador deberá reportar los equipos y dejarlos obligatoriamente en portería antes de su ingreso a <strong>GRUPO PECUARIO</strong>.
          </li>
          <li>Durante la jornada laboral, está prohibido el uso no autorizado de cualquier equipo electrónico y de comunicación, u cualquier objeto personal, a fin de:</li>
        </ol>
        <p className="ing-literal">
          a) <strong>EVITAR INCIDENTES Y/O ACCIDENTES</strong>
        </p>
        <p>
          Debido a que el uso de dichos equipos, distraería la atención del colaborador en el desempeño de sus funciones, así como errores en la ejecución de funciones asignadas,
          riesgos en las relaciones comerciales y pérdidas económicas.
        </p>
        <p className="ing-literal">
          a) <strong>DIVULGAR INFORMACIÓN DEL NEGOCIO</strong>
        </p>
        <p>Debido a que el uso, divulgaría información confidencial y comercial del negocio.</p>
        <p className="ing-derecha">{lugarYFecha(datos.fecha)}</p>
      </Hoja>
      <Hoja marca={marca} pagina={2} total={2}>
        {/* Nombre y DNI debajo de la firma, centrados (solo firma el colaborador). */}
        <Firma firma={firma} clase="es-centrada ing-firma--celulares">
          <strong>{nombreDocumento(datos.nombre)}</strong>
          <strong>DNI N° {datos.dni}</strong>
        </Firma>
        <p className="ing-nota">
          <strong>NOTA:</strong> <em>Si se incumple esta política, decomisaremos el equipo y sancionaremos de acuerdo a las normas internas de la empresa.</em>
        </p>
      </Hoja>
    </>
  );
}

/* ---------- Política de vestimenta y aseo (2 páginas) ---------- */
function Vestimenta({ datos, marca, firma }: Omit<Propiedades, 'tipo'>) {
  return (
    <>
      <Hoja marca={marca} pie pagina={1} total={2} clase="es-compacta">
        <Logo />
        <h3 className="ing-titulo-serif">POLITICA DE VESTIMENTA Y ASEO GRUPO PECUARIO S.AC.</h3>
        <p>
          <strong>Grupo Pecuario SAC</strong> reconoce la importancia de mantener los estándares de higiene, seguridad y presentación personal de sus colaboradores en todas nuestras
          operaciones, por lo tanto se ha establecido la siguiente política de vestimenta:
        </p>
        <h4>
          1. <u>Objetivo:</u>
        </h4>
        <p className="ing-sangria">
          El objetivo principal de esta política es garantizar que todos los colaboradores que laboran en Grupo Pecuario SAC mantengan un estándar uniforme y adecuado en su
          vestimenta, que cumpla con los requisitos de seguridad e higiene necesarios para el manejo de productos cárnicos así como el cuidado de la apariencia personal.
        </p>
        <h4>2. Uniforme Obligatorio:</h4>
        <p>Los colaboradores de Grupo Pecuario están obligados a usar el uniforme proporcionado por la empresa de acuerdo a las áreas. Este uniforme consiste en:</p>
        <h4>2.1 Personal de Distribución</h4>
        <ul className="ing-vinetas es-pegada">
          <li>
            Todos los colaboradores de distribución debe usar un uniforme proporcionado por la empresa, este uniforme consta de:
            <ul className="ing-rombos">
              <li><strong>Polo</strong>: Limpio y en buen estado.</li>
              <li><strong>Pantalón con cintas reflectivas</strong>: Sin roturas ni manchas.</li>
              <li><strong>Calzado cerrado</strong>: Botas o zapatos antideslizantes y resistentes.</li>
              <li><strong>Casco y toca descartable</strong>: Para evitar la contaminación de los productos.</li>
              <li><strong>Faja</strong>: Para evitar hernias abdominales.</li>
            </ul>
          </li>
        </ul>
        <h4>2.2 Personal de Almacén</h4>
        <ul className="ing-vinetas es-pegada">
          <li>
            Todos los colaboradores de almacén debe usar un uniforme proporcionado por la empresa, este uniforme consta de:
            <ul className="ing-rombos">
              <li><strong>Polo</strong>: Limpio y en buen estado.</li>
              <li><strong>Mameluco jean:</strong> Sin roturas ni manchas.</li>
              <li><strong>Calzado cerrado</strong>: Botas o zapatos antideslizantes y resistentes.</li>
              <li><strong>Casco y toca descartable</strong>: Para evitar la contaminación de los productos.</li>
              <li><strong>Faja</strong>: Para evitar hernias abdominales</li>
            </ul>
          </li>
        </ul>
        <h4>2.3 Personal de Producción/Desarrollo de Productos</h4>
        <ul className="ing-vinetas es-pegada">
          <li>
            Todos los colaboradores de almacén deben usar un uniforme proporcionado por la empresa, este uniforme consta de:
            <ul className="ing-rombos">
              <li><strong>Polo blanco</strong>: Limpio y en buen estado.</li>
              <li><strong>Pantalón Blanco:</strong> Sin roturas ni manchas.</li>
              <li><strong>Calzado cerrado</strong>: Botas o zapatos antideslizantes y resistentes.</li>
              <li><strong>Casco, gorro de tela y toca descartable</strong>: Para evitar la contaminación de los productos.</li>
              <li><strong>Tapa boca:</strong> Para evitar la contaminación de los productos.</li>
              <li><strong>Faja</strong>: Para evitar hernias abdominales</li>
            </ul>
          </li>
        </ul>
      </Hoja>
      <Hoja marca={marca} pie pagina={2} total={2} clase="es-compacta">
        <Logo />
        <ul className="ing-vinetas es-pegada">
          <li>El uniforme debe llevarse correctamente de acuerdo al área a la que pertenece.</li>
        </ul>
        <h4>2.4 Personal Administrativo</h4>
        <ul className="ing-vinetas es-pegada">
          <li>
            Todos los colaboradores administrativos deben mantener una vestimenta limpia, adecuada para la oficina y presentable en todo momento (evitar escotes, leggins,
            transparencias, minifaldas y jeans rasgados).
          </li>
          <li>
            Se prohíbe el uso de joyería excesiva (piercing), no aretes ni joyas en cuello, oídos, manos o accesorios que puedan representar un riesgo para la seguridad o la higiene
            en el área de trabajo.
            <ul className="ing-rombos">
              <li><strong>Calzado</strong>: No chancletas</li>
              <li><strong>Short deportivos/bermudas</strong>: Prohibido su uso.</li>
              <li><strong>Uso de buzos deportivos:</strong> sólo los días sábados.</li>
              <li><strong>Uso de gorros:</strong> dentro de las oficinas.</li>
            </ul>
          </li>
        </ul>
        <h4>3. Elementos de Protección Personal</h4>
        <ul className="ing-vinetas es-pegada">
          <li>
            Los colaboradores deben usar los elementos de protección personal (EPP) apropiados:
            <ul className="ing-rombos">
              <li><strong>Guantes</strong>: Para manipular productos congelados o herramientas.</li>
              <li><strong>Casco</strong>: En áreas donde se requiera.</li>
              <li><strong>Delantal o mandil</strong>: Para evitar manchas en la ropa.</li>
              <li><strong>Faja</strong>: Para evitar hernias abdominales.</li>
              <li><strong>Botas de seguridad</strong>: Antideslizantes y resistentes al frío.</li>
            </ul>
          </li>
        </ul>
        <p>
          <strong>4. Higiene Personal:</strong> Todos los colaboradores deben mantener los estándares de higiene personal. Los caballeros deben lucir un cabello limpio y corto, se
          debe mantener las uñas cortas y limpias. El uso de perfumes fuertes o colonias incluyendo cremas que puedan interferir con los productos cárnicos por ellos está prohibido su
          uso en las áreas de operaciones.
        </p>
        <p>
          <strong>5. Seguridad en la Vestimenta:</strong> Se requiere que todos los colaboradores utilicen el equipo de protección personal proporcionado por la empresa en todo momento
          durante su turno de trabajo. Esto incluye el uso adecuado de los guantes, fajas y las botas de trabajo para prevenir lesiones.
        </p>
        <p>
          <strong>6. Cumplimiento:</strong> El incumplimiento de esta política puede aplicar en acciones disciplinarias, que pueden incluir advertencias formales, suspensiones o incluso
          terminación del empleo, dependiendo de la gravedad de la infracción.
        </p>
        <p>
          <strong>7. Revisión de la Política:</strong> Esta política de vestimenta y aseo será revisada regularmente para asegurar su eficacia y su cumplimiento con las normativas de
          seguridad e higiene vigentes. Se fomentará la retroalimentación de los colaboradores para realizar mejoras continuas en nuestros estándares de la vestimenta.
        </p>
        <p>Al seguir esta política de vestimenta y aseo, estamos comprometidos a mantener los niveles de seguridad, higiene y presentación en todas nuestras áreas.</p>
        <p>Agradecemos la colaboración de todos en la implementación de esta política.</p>
        <p>Gestión Humana</p>
        <Recepcion datos={datos} firma={firma} documento="la presente Política de Vestimenta y Aseo" />
      </Hoja>
    </>
  );
}

/* ---------- Declaración jurada de no tener antecedentes policiales (GC-RH-F007) ---------- */
function Antecedentes({ datos, marca, firma }: Omit<Propiedades, 'tipo'>) {
  return (
    <Hoja marca={marca} clase="es-grande">
      <EncabezadoFormato
        tipo="antecedentes"
        titulo={
          <>
            DECLARACIÓN JURADA DE NO TENER
            <br />
            ANTECEDENTES POLICIALES
          </>
        }
      />
      <p className="ing-relleno">
        Yo <span className="ing-dato">{nombreDocumento(datos.nombre)}</span> identificado(a) con DNI Nº <span className="ing-dato">{datos.dni}</span> y con domicilio en{' '}
        <span className="ing-dato">{datos.domicilio}</span>.
      </p>
      <p className="ing-espacio">
        <strong>DECLARO BAJO JURAMENTO:</strong>
      </p>
      <p>
        <strong>· NO REGISTRAR ANTECEDENTES POLICIALES.</strong>
      </p>
      <p>
        En caso de resultar falsa la información que proporciono, declaro haber incurrido en el delito de falsa declaración en Procesos Administrativos – Artículo 411º del{' '}
        <strong>Código Penal</strong> y Delito contra la Fe Pública – Título XIX del Código Penal, acorde al artículo 33° del Texto Único Ordenado de la{' '}
        <strong>Ley Nº 27444</strong>, Ley del Procedimiento Administrativo General, aprobado por <strong>Decreto Supremo N° 006-2017-JUS</strong>.
      </p>
      <p>Por lo que suscribo la presente en honor a la verdad.</p>
      <p>{lugarYFecha(datos.fecha, 'del 20….')}</p>
      <div className="ing-huella-firma">
        <Firma firma={firma}>
          <strong>{nombreDocumento(datos.nombre)}</strong>
          <strong>DNI N° {datos.dni}</strong>
        </Firma>
      </div>
    </Hoja>
  );
}

/* ---------- Croquis de domicilio (GC-RH-F006) ---------- */
function Croquis({ datos, marca, firma, croquis, herramientas, referencias }: Omit<Propiedades, 'tipo'>) {
  return (
    <Hoja marca={marca}>
      <EncabezadoFormato tipo="croquis" titulo="CROQUIS DE DOMICILIO" />
      <p>
        A continuación se solicita graficar un croquis de tu domicilio. Cada cuadrado es una cuadra. No está permitido dibujar más cuadrados, solo puedes dibujar líneas horizontales o
        verticales para señalar las avenidas (considerar al menos una avenida principal). Identificar tu vivienda con una flecha.
      </p>
      {herramientas}
      {/* Las 12 cuadras; encima, el croquis del trabajador (dibujándolo o ya firmado). */}
      <div className="ing-croquis-zona">
        <div className="ing-cuadras" aria-label="Cuadrícula del croquis: 12 cuadras">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        {croquis}
      </div>
      <p className="ing-referencias">Referencias adicionales:</p>
      <p className="ing-puntos">Domicilio: {datos.domicilio}</p>
      {referencias ?? (
        <>
          <p className="ing-puntos" />
          <p className="ing-puntos" />
        </>
      )}
      <p>
        <strong>
          <u>Autorizo la visita domiciliaria para confirmar mi domicilio.</u>
        </strong>
      </p>
      <p className="ing-espacio">{lugarYFecha(datos.fecha)}</p>
      <div className="ing-firma-derecha">
        <Firma firma={firma}>
          <strong>{nombreDocumento(datos.nombre)}</strong>
          <strong>DNI N° {datos.dni}</strong>
        </Firma>
      </div>
    </Hoja>
  );
}

/** Hojas del documento de ingreso pedido, con los datos del trabajador. */
export function HojasIngreso({ tipo, ...resto }: Propiedades) {
  const hojas: Record<TipoIngreso, ReactNode> = {
    induccion: <Induccion {...resto} />,
    confidencialidad: <Confidencialidad {...resto} />,
    etica: <Etica {...resto} />,
    celulares: <Celulares {...resto} />,
    vestimenta: <Vestimenta {...resto} />,
    antecedentes: <Antecedentes {...resto} />,
    croquis: <Croquis {...resto} />,
  };
  return <div className="doc-paginas">{hojas[tipo]}</div>;
}

/**
 * Cargos y declaraciones que firma solo el colaborador (Cargo de Reglamento Interno, DJ de domicilio):
 * mismo formato GP que los documentos de ingreso. La firma va al centro, con el nombre y el DNI debajo.
 */
export function HojaDeclaracion({ titulo, parrafos, datos, marca, firma, antes }: { titulo: string; parrafos: ReactNode[]; datos: DatosIngreso; marca: ReactNode; firma: ReactNode; /** Hojas que van antes (p. ej. el Reglamento completo). */ antes?: ReactNode }) {
  return (
    <div className="doc-paginas">
      {antes}
      <Hoja marca={marca} pie clase="es-grande">
        <Logo />
        <h3 className="ing-titulo-subrayado ing-titulo-declaracion">{titulo}</h3>
        {parrafos.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p className="ing-lugar">{lugarYFecha(datos.fecha)}</p>
        <Firma firma={firma} clase="es-centrada ing-firma--declaracion">
          <strong>{nombreDocumento(datos.nombre)}</strong>
          <strong>DNI N° {datos.dni}</strong>
        </Firma>
      </Hoja>
    </div>
  );
}

/** Nombre en el formato de los documentos de la empresa (apellidos primero, sin coma). */
export const nombreEnDocumento = (nombre: string) => nombreDocumento(nombre);
