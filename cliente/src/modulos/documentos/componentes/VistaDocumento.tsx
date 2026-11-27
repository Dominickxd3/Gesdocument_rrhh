import { TrazoFirma } from '@/modulos/boletas-pago/componentes/TrazoFirma';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { guardarComoPdf, nombreArchivo } from '@/compartido/documentos/guardarComoPdf';
import { BarraFirma, LienzoFirma, useControlFirma, type ControlFirma } from '@/compartido/componentes/LienzoFirma';
import { repositorioBoletas } from '@/modulos/boletas-pago/aplicacion/repositorioBoletas';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { archivoSubido } from '@/compartido/componentes/BotonArchivo';
import { fechaLarga, momento } from '@/compartido/almacen/crearAlmacen';
import { buscarTrabajador } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { nombreLegible } from '@/modulos/trabajadores/dominio/trabajador';
import { esDeIngreso, etiquetaTipo, ultimoEvento, type CroquisFirmado, type Documento, type EventoDocumento } from '../dominio/documento';
import { adendaVendedorDeContrato, armarAdenda, type DatosAdenda } from '../dominio/plantillaAdenda';
import { armarContrato } from '../dominio/plantillaContrato';
import { HojasReglamento } from './HojasReglamento';
import { HerramientasCroquis, LienzoCroquis, useControlCroquis } from './LienzoCroquis';
import { HojaDeclaracion, HojasIngreso, PIE_DOCUMENTOS, nombreEnDocumento } from './HojasIngreso';
import { fechaEnTexto } from '@/compartido/formato/montos';

/** Texto breve de los documentos sin modelo propio (los de ingreso, contrato y adenda tienen su hoja). */
const TEXTOS: Partial<Record<Documento['tipo'], (n: string, dni: string, cargo: string, area: string, ingreso: string) => string[]>> = {
  contrato: (n, dni, cargo, area, ingreso) => [
    `Conste por el presente documento el Contrato de Trabajo que celebran de una parte GRUPO PECUARIO S.A.C. y de la otra parte ${n}, identificado(a) con DNI ${dni}.`,
    `EL TRABAJADOR prestará servicios como ${cargo} en el área ${area}, a partir del ${ingreso}, bajo las condiciones establecidas por la empresa.`,
  ],
  adenda: (n, dni, cargo) => [
    `Por la presente adenda, GRUPO PECUARIO S.A.C. y ${n} (DNI ${dni}) acuerdan prorrogar el contrato de trabajo vigente, manteniendo el cargo de ${cargo}.`,
    'Las demás cláusulas del contrato original se mantienen sin modificación.',
  ],
  constancia: (n, dni, cargo, area, ingreso) => [
    `GRUPO PECUARIO S.A.C. hace constar que ${n}, identificado(a) con DNI ${dni}, labora en la empresa desde el ${ingreso}, desempeñándose como ${cargo} en el área ${area}.`,
    'Se expide la presente a solicitud del interesado para los fines que estime conveniente.',
  ],
  reglamento: (n, dni) => [
    `Yo, ${n}, con DNI ${dni}, declaro haber recibido un ejemplar del Reglamento Interno de Trabajo de GRUPO PECUARIO S.A.C. y me comprometo a cumplirlo.`,
  ],
  domicilio: (n, dni) => [`Yo, ${n}, con DNI ${dni}, declaro bajo juramento que mi domicilio actual es el registrado en mi ficha de personal.`],
};

/**
 * Marca de agua: /marca-agua.png si existe en `public` (el logo tenue de Gestión Humana);
 * si no, el logo de la empresa atenuado.
 */
export function MarcaAgua() {
  const [src, setSrc] = useState('/logo-boleta.png');
  useEffect(() => {
    const prueba = new Image();
    prueba.onload = () => setSrc('/marca-agua.png');
    prueba.src = '/marca-agua.png';
  }, []);
  // Una sola marca de agua centrada: en pantalla queda fija en el centro al desplazarse;
  // al imprimir se repite una vez por hoja, centrada (como la marca de agua de Word).
  return (
    <div className={`doc-marca-agua${src === '/marca-agua.png' ? ' es-propia' : ''}`} aria-hidden="true">
      <img src={src} alt="" />
    </div>
  );
}

/** Número de página al pie de cada hoja (el contrato del vendedor tiene más de una). */
function Pagina({ numero, total }: { numero: number; total: number }) {
  return total > 1 ? <span className="doc-pagina">Página {numero} de {total}</span> : null;
}

/** Adenda armada con el modelo de Gestión Humana y los datos del trabajador. */
function HojaAdenda({ datos, firma, pagina = 1, total = 1 }: { datos: DatosAdenda; firma?: EventoDocumento; pagina?: number; total?: number }) {
  const a = armarAdenda(datos);
  return (
    <article className="doc-hoja doc-legal">
      <MarcaAgua />
      <Membrete />
      <h3>ADENDA AL CONTRATO DE TRABAJO</h3>
      <p>{a.introduccion}</p>
      <h4>ANTECEDENTES</h4>
      {a.antecedentes.map((x) => (
        <p key={x.titulo}>
          <strong>{x.titulo}:</strong> {x.texto}
        </p>
      ))}
      <h4>AMBAS PARTES DECLARAN:</h4>
      {a.clausulas.map((c) => (
        <div key={c.ordinal}>
          <p>
            <strong>{c.ordinal}</strong> {c.texto}
          </p>
          {c.items && (
            <ol className="doc-legal__items">
              {c.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          )}
        </div>
      ))}
      <p>{a.cierre}</p>
      <Firmas nombre={datos.trabajador.nombre} dni={datos.trabajador.dni} firma={firma} />
      <Pagina numero={pagina} total={total} />
    </article>
  );
}

/**
 * Firma del representante: la misma que se sube en Boletas → Configuración (una sola firma para todos los documentos).
 * Se lee una vez por apertura de la vista previa.
 */
function useFirmaEmpleador() {
  const [firma, setFirma] = useState<string | null>(null);
  useEffect(() => {
    void repositorioBoletas.obtenerConfiguracion().then((c) => setFirma(c.firmaEmpleador));
  }, []);
  return firma;
}

/**
 * Firma del trabajador tal como la dibujó al firmar. Los documentos de ejemplo firmados antes
 * de existir el recuadro de firma muestran un trazo de ejemplo.
 */
function FirmaTrabajador({ evento }: { evento: EventoDocumento }) {
  return evento.firmaImagen ? (
    <img className="doc-firma-trabajador" src={evento.firmaImagen} alt={`Firma de ${evento.usuario}`} title={`Firmado el ${momento(evento.fecha)}`} />
  ) : (
    <span className="doc-firma-trabajador" title={`Firmado el ${momento(evento.fecha)}`}>
      <TrazoFirma etiqueta={`Firma de ${evento.usuario}`} />
    </span>
  );
}

/**
 * Bloque de firmas como en los contratos de Gestión Humana:
 * a la izquierda la firma del representante sobre la línea, "GRUPO PECUARIO S.A.C." y "EL EMPLEADOR";
 * a la derecha el nombre del trabajador, su DNI y "EL TRABAJADOR".
 */
/** Mientras el trabajador firma, su espacio de firma en el documento es un recuadro para dibujar. */
const ContextoFirmar = createContext<ControlFirma | null>(null);

/** Firma ya registrada, recuadro para dibujarla o espacio vacío. */
function EspacioFirmaTrabajador({ firma, pendiente }: { firma?: EventoDocumento; /** Qué mostrar mientras el trabajador aún no firma. */ pendiente?: ReactNode }) {
  const control = useContext(ContextoFirmar);
  if (firma) return <FirmaTrabajador evento={firma} />;
  return control ? <LienzoFirma control={control} /> : <>{pendiente ?? null}</>;
}

function Firmas({ nombre, dni, firma }: { nombre: string; dni: string; firma?: EventoDocumento }) {
  const firmaEmpleador = useFirmaEmpleador();
  return (
    <div className="doc-firmas">
      <div className="doc-firmas__parte">
        <div className="doc-firmas__espacio">
          {firmaEmpleador ? <img src={firmaEmpleador} alt="Firma del representante legal" /> : <small>Firma del representante (Boletas → Configuración)</small>}
        </div>
        <span className="doc-firmas__linea" />
        <strong>GRUPO PECUARIO S.A.C.</strong>
        <span>EL EMPLEADOR</span>
      </div>
      <div className="doc-firmas__parte">
        <div className="doc-firmas__espacio">
          <EspacioFirmaTrabajador firma={firma} />
        </div>
        <span className="doc-firmas__linea" />
        <strong>{nombre.replace(',', '')}</strong>
        <span>DNI N° {dni}</span>
        <span>EL TRABAJADOR</span>
      </div>
    </div>
  );
}

/** Encabezado con el logo de la empresa para los documentos legales. */
function Membrete() {
  return (
    <header className="doc-membrete">
      <img src="/logo-boleta.png" alt="Grupo Pecuario" />
    </header>
  );
}

const LETRAS = 'abcdefghijklmnopqrstuvwxyz';

/** Contrato por incremento de actividad, con el formato del Word de Gestión Humana y el logo. */
function HojaContrato({ documento: d, firma, total }: { documento: Documento; firma?: EventoDocumento; total: number }) {
  const c = armarContrato(d.contrato!);
  const lista = (l: { items: string[]; tipo: 'a' | '1' }) => (
    <ol className="doc-legal__items" type={l.tipo}>
      {l.items.map((item, i) => (
        <li key={i} value={i + 1} data-marca={l.tipo === 'a' ? `${LETRAS[i % 26]})` : `${i + 1}.`}>
          {item}
        </li>
      ))}
    </ol>
  );
  return (
    <article className="doc-hoja doc-legal">
      <MarcaAgua />
      <Membrete />
      <h3>{c.titulo}</h3>
      <p>{c.introduccion}</p>
      {c.secciones.map((s) => (
        <section key={s.titulo}>
          <h4>{s.titulo}</h4>
          {s.parrafos.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
          {s.lista && lista(s.lista)}
          {s.despues?.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
          {s.lista2 && lista(s.lista2)}
          {s.final?.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
        </section>
      ))}
      <p>{c.cierre}</p>
      <Firmas nombre={d.contrato!.trabajador.nombre} dni={d.contrato!.trabajador.dni} firma={firma} />
      <Pagina numero={1} total={total} />
    </article>
  );
}

const GERENTE_GENERAL = import.meta.env.VITE_GERENTE_GENERAL ?? 'NOMBRE DEL GERENTE GENERAL';
const DNI_GERENTE_GENERAL = import.meta.env.VITE_DNI_GERENTE_GENERAL ?? '00000000';
const RUC_EMPRESA = import.meta.env.VITE_RUC_EMPRESA ?? '00000000000';

/**
 * Constancia de trabajo con el formato de Gestión Humana: la suscribe el Gerente General.
 * Si solo firma la empresa, su firma va al centro; si el trabajador firma la recepción,
 * la empresa queda a la izquierda y el trabajador a la derecha.
 */
function HojaConstancia({ nombre, dni, cargo, fecha, firma, recibe }: { nombre: string; dni: string; cargo: string; fecha: string; firma?: EventoDocumento; recibe: boolean }) {
  const firmaEmpleador = useFirmaEmpleador();
  const empresa = (
    <div className="doc-firmas__parte">
      <div className="doc-firmas__espacio">
        {firmaEmpleador ? <img className="doc-firma-empresa" src={firmaEmpleador} alt="Firma del Gerente General" /> : <small>Firma del Gerente General (Boletas → Configuración)</small>}
      </div>
      <span className="doc-firmas__linea" />
      <strong>GRUPO PECUARIO S.A.C.</strong>
      <span>{GERENTE_GENERAL}</span>
      <span>GERENTE GENERAL</span>
    </div>
  );
  return (
    <article className="doc-hoja doc-legal ing-hoja constancia">
      <MarcaAgua />
      <div className="ing-hoja__cuerpo">
        <img className="ing-logo" src="/logo-boleta.png" alt="Grupo Pecuario" />
        <h3 className="constancia__titulo">CONSTANCIA</h3>
        <p>
          Yo, <strong>{GERENTE_GENERAL},</strong> identificado con DNI N° <strong>{DNI_GERENTE_GENERAL},</strong> como Gerente General de la empresa <strong>GRUPO PECUARIO SAC</strong> que se{' '}
          <strong>
            <u>
              <em>dedica a la comercialización de productos de primera necesidad</em>
            </u>
          </strong>
          , con RUC N° {RUC_EMPRESA} y con domicilio en Av. Canto Bello 177 Urb. Canto Bello – San Juan de Lurigancho, suscribe que el colaborador(a) <strong>{nombre.replace(',', '')}</strong> con DNI N° {dni} viene cumpliendo labores en la empresa como <strong>{cargo.toUpperCase()}.</strong>
        </p>
        <p>Se expide la presente a solicitud del interesado para los fines que estime conveniente.</p>
        <p>Lima, {fechaEnTexto(fecha)}.</p>
        {recibe ? (
          <div className="doc-firmas">
            {empresa}
            <div className="doc-firmas__parte">
              <div className="doc-firmas__espacio">
                <EspacioFirmaTrabajador firma={firma} />
              </div>
              <span className="doc-firmas__linea" />
              <strong>{nombre.replace(',', '')}</strong>
              <span>DNI N° {dni} · Recibí conforme</span>
            </div>
          </div>
        ) : (
          <div className="constancia__firma-unica">{empresa}</div>
        )}
      </div>
      <footer className="ing-pie">
        <span />
        {PIE_DOCUMENTOS}
      </footer>
    </article>
  );
}

/** Vista previa del documento: el archivo subido o el texto generado desde la plantilla. */
interface PropiedadesVista {
  documento: Documento | null;
  visible: boolean;
  alCerrar: () => void;
  /** Trabajador firmando: dibuja su firma sobre su línea del documento y confirma. */
  alFirmar?: (imagen: string, croquis?: CroquisFirmado) => void;
  /** Plantillas: vista previa del formato con datos de ejemplo. */
  esMuestra?: boolean;
}

export function VistaDocumento({ documento: d, visible, alCerrar, alFirmar, esMuestra = false }: PropiedadesVista) {
  const archivo = d?.origen.tipo === 'archivo' ? archivoSubido(d.origen.nombre) : undefined;
  const t = d ? buscarTrabajador(d.dni) : undefined;
  const firma = d ? ultimoEvento(d, 'firmado') : undefined;
  const visor = useRef<HTMLDivElement>(null);
  const control = useControlFirma();
  const { borrar } = control;
  const [zoom, setZoom] = useState(1);
  const firmando = !!alFirmar && !firma;
  // Croquis de domicilio: el trabajador lo dibuja sobre las cuadras al firmar.
  const croquis = useControlCroquis();
  const { borrar: borrarCroquis } = croquis;
  const esCroquis = d?.tipo === 'croquis';
  // Paso 1: dibujar el croquis y escribir las referencias. Paso 2: recién aparece la firma.
  const [paso, setPaso] = useState<'croquis' | 'firma'>('croquis');
  const [referencias, setReferencias] = useState('');
  const [croquisListo, setCroquisListo] = useState<string | null>(null);
  const enCroquis = firmando && esCroquis && paso === 'croquis';
  const puedeContinuar = !croquis.vacio && referencias.trim().length > 0;

  useEffect(() => {
    if (visible) {
      borrar();
      borrarCroquis();
      setPaso('croquis');
      setReferencias('');
      setCroquisListo(null);
      setZoom(1);
    }
  }, [visible, borrar, borrarCroquis]);

  return (
    <Dialog
      visible={visible && !!d}
      onHide={alCerrar}
      header={
        d && (
          <div className="pp-ventana__titulo">
            <span>{etiquetaTipo(d.tipo)}</span>
            <small>{esMuestra ? 'Vista previa del formato · datos de ejemplo' : nombreLegible(d.trabajador)}</small>
          </div>
        )
      }
      className="pp-ventana dm-ventana-documento"
      style={{ width: '820px' }}
      breakpoints={{ '860px': '100vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          {firmando && esCroquis && paso === 'firma' && (
            <Button label="Volver al croquis" icon="pi pi-arrow-left" outlined className="pp-boton-secundario" onClick={() => setPaso('croquis')} />
          )}
          {!firmando && (
            <Button
              label={archivo ? 'Descargar' : 'Descargar PDF'}
              icon="pi pi-download"
              outlined
              className="pp-boton-secundario"
              onClick={() =>
                archivo
                  ? window.open(archivo.url, '_blank', 'noopener')
                  : d && void guardarComoPdf(visor.current, nombreArchivo(etiquetaTipo(d.tipo), d.trabajador))
              }
            />
          )}
          <span className="pp-espaciador" />
          {firmando ? (
            <Button label="Cancelar" text onClick={alCerrar} />
          ) : (
            <Button label="Cerrar" className="pp-boton-principal" onClick={alCerrar} />
          )}
        </div>
      }
    >
      <ContextoFirmar.Provider value={firmando && !enCroquis ? control : null}>
      <div className="dm-visor" style={{ zoom }} ref={visor}>
        {d && archivo ? (
          <>
            {archivo.tipo.startsWith('image/') ? <img src={archivo.url} alt="" /> : <iframe src={archivo.url} title={etiquetaTipo(d.tipo)} />}
            {/* Documento subido como archivo: se firma en este espacio, bajo el documento. */}
            {firmando && (
              <div className="doc-firma-archivo">
                <LienzoFirma control={control} />
                <span className="doc-firmas__linea" />
                <strong>{nombreLegible(d.trabajador)}</strong>
              </div>
            )}
          </>
        ) : d?.contrato ? (
          // Vendedores: el contrato y la adenda de obligaciones se firman juntos (dos páginas).
          <div className="doc-paginas">
            <HojaContrato documento={d} firma={firma} total={d.contrato.adendaVendedor ? 2 : 1} />
            {d.contrato.adendaVendedor && <HojaAdenda datos={adendaVendedorDeContrato(d.contrato)} firma={firma} pagina={2} total={2} />}
          </div>
        ) : d?.tipo === 'constancia' ? (
          <HojaConstancia
            nombre={d.trabajador}
            dni={d.dni}
            cargo={t?.cargo ?? 'CARGO DEL TRABAJADOR'}
            fecha={ultimoEvento(d, 'enviado')?.fecha ?? d.historial[0].fecha}
            firma={firma}
            recibe={!!firma || firmando}
          />
        ) : d?.adenda ? (
          <HojaAdenda datos={d.adenda} firma={firma} />
        ) : d && (d.tipo === 'reglamento' || d.tipo === 'domicilio') ? (
          <HojaDeclaracion
            antes={d.tipo === 'reglamento' ? <HojasReglamento marca={<MarcaAgua />} /> : undefined}
            titulo={d.tipo === 'reglamento' ? 'CARGO DE RECEPCIÓN DEL REGLAMENTO INTERNO DE TRABAJO' : 'DECLARACIÓN JURADA DE DOMICILIO'}
            parrafos={
              d.tipo === 'reglamento'
                ? [
                    <>
                      Yo, <strong>{nombreEnDocumento(d.trabajador)}</strong>, identificado(a) con DNI N° <strong>{d.dni}</strong>, declaro haber recibido un ejemplar del{' '}
                      <strong>Reglamento Interno de Trabajo</strong> de GRUPO PECUARIO S.A.C., el cual he leído y comprendido.
                    </>,
                    'Me comprometo a cumplir las disposiciones, obligaciones y prohibiciones establecidas en dicho reglamento, así como las demás normas internas de la empresa.',
                  ]
                : [
                    <>
                      Yo, <strong>{nombreEnDocumento(d.trabajador)}</strong>, identificado(a) con DNI N° <strong>{d.dni}</strong>, declaro bajo juramento que mi domicilio actual es:{' '}
                      <span className="ing-dato">{t?.domicilio ?? '[Domicilio del trabajador]'}</span>.
                    </>,
                    'Me comprometo a comunicar a Gestión Humana cualquier cambio de domicilio. En caso de resultar falsa la información que proporciono, me someto a las acciones que correspondan según la normativa vigente.',
                  ]
            }
            datos={{ nombre: d.trabajador, dni: d.dni, domicilio: t?.domicilio ?? '', fecha: firma?.fecha ?? ultimoEvento(d, 'enviado')?.fecha ?? d.historial[0]?.fecha }}
            marca={<MarcaAgua />}
            firma={<EspacioFirmaTrabajador firma={firma} pendiente={<small className="ing-firma__pendiente">Pendiente de firma digital</small>} />}
          />
        ) : d && esDeIngreso(d.tipo) ? (
          // Documentos de ingreso: modelo de Gestión Humana con los datos de la ficha; la fecha se llena al firmar.
          <HojasIngreso
            tipo={d.tipo}
            // La fecha se completa sola: la de la firma; antes de firmar, la del envío (o la de creación).
            datos={{ nombre: d.trabajador, dni: d.dni, domicilio: t?.domicilio ?? '[Domicilio del trabajador]', fecha: firma?.fecha ?? ultimoEvento(d, 'enviado')?.fecha ?? d.historial[0]?.fecha }}
            marca={<MarcaAgua />}
            firma={
              <EspacioFirmaTrabajador
                firma={firma}
                pendiente={
                  enCroquis ? (
                    <small className="ing-firma__pendiente-croquis">La firma se habilita al terminar el croquis y las referencias</small>
                  ) : (
                    <small className="ing-firma__pendiente">Pendiente de firma digital</small>
                  )
                }
              />
            }
            herramientas={enCroquis ? <HerramientasCroquis control={croquis} /> : undefined}
            croquis={
              esCroquis ? (
                firma?.croquisImagen ? (
                  <img className="croquis-dibujado" src={firma.croquisImagen} alt="Croquis de domicilio dibujado por el trabajador" />
                ) : firmando && paso === 'firma' && croquisListo ? (
                  <img className="croquis-dibujado" src={croquisListo} alt="Tu croquis de domicilio" />
                ) : firmando ? (
                  <LienzoCroquis control={croquis} />
                ) : undefined
              ) : undefined
            }
            referencias={
              !esCroquis ? undefined : enCroquis ? (
                <textarea
                  className="ing-referencias-campo"
                  value={referencias}
                  maxLength={300}
                  onChange={(e) => setReferencias(e.target.value)}
                  placeholder="Ej.: A media cuadra del mercado, frente al parque. Casa de 2 pisos color verde, puerta negra."
                  aria-label="Referencias de tu domicilio"
                />
              ) : firma?.croquisReferencias || (firmando && referencias) ? (
                <p className="ing-puntos ing-referencias-texto">{firma?.croquisReferencias ?? referencias}</p>
              ) : undefined
            }
          />
        ) : (
          d && (
            <article className="doc-hoja">
              <header>
                <img src="/isotipo-empresa.png" alt="" />
                <small>
                  GRUPO PECUARIO S.A.C.
                  <br />
                  Gestión Humana
                </small>
              </header>
              <h3>{etiquetaTipo(d.tipo).toUpperCase()}</h3>
              {(TEXTOS[d.tipo] ?? (() => []))(
                d.trabajador,
                d.dni,
                t?.cargo ?? '—',
                t?.area ?? '—',
                t ? fechaLarga(t.fechaIngreso) : '—',
              ).map((p) => (
                <p key={p}>{p}</p>
              ))}
              <div className="doc-hoja__firmas">
                <div>
                  <span />
                  Gestión Humana
                </div>
                <div>
                  {firma || alFirmar ? <EspacioFirmaTrabajador firma={firma} /> : <span />}
                  {nombreLegible(d.trabajador)}
                </div>
              </div>
            </article>
          )
        )}
      </div>
      </ContextoFirmar.Provider>
      {enCroquis && (
        <div className="croquis-paso" role="group" aria-label="Completar el croquis">
          <span className="croquis-paso__lista">
            <span className={croquis.vacio ? '' : 'es-listo'}>
              <i className={croquis.vacio ? 'pi pi-circle' : 'pi pi-check-circle'} aria-hidden="true" /> Croquis
            </span>
            <span className={referencias.trim() ? 'es-listo' : ''}>
              <i className={referencias.trim() ? 'pi pi-check-circle' : 'pi pi-circle'} aria-hidden="true" /> Referencias
            </span>
          </span>
          <button
            type="button"
            disabled={!puedeContinuar}
            title={puedeContinuar ? undefined : 'Dibuja tu croquis y escribe las referencias de tu domicilio'}
            onClick={() => {
              setCroquisListo(croquis.imagen());
              setPaso('firma');
              requestAnimationFrame(() =>
                requestAnimationFrame(() => document.querySelector('.lienzo-firma')?.scrollIntoView({ block: 'center', behavior: 'smooth' })),
              );
            }}
          >
            Continuar a la firma <i className="pi pi-arrow-right" aria-hidden="true" />
          </button>
        </div>
      )}
      {firmando && !enCroquis && (
        <BarraFirma
          control={control}
          zoom={zoom}
          alCambiarZoom={setZoom}
          alEnviar={() => {
            const imagen = control.imagen();
            if (!imagen) return;
            alFirmar?.(imagen, esCroquis && croquisListo ? { imagen: croquisListo, referencias: referencias.trim() } : undefined);
          }}
        />
      )}
    </Dialog>
  );
}
