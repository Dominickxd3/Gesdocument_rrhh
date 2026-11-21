import { TrazoFirma } from '@/modulos/boletas-pago/componentes/TrazoFirma';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { guardarComoPdf, nombreArchivo } from '@/compartido/documentos/guardarComoPdf';
import { BarraFirma, LienzoFirma, useControlFirma, type ControlFirma } from '@/compartido/componentes/LienzoFirma';
import { repositorioBoletas } from '@/modulos/boletas-pago/aplicacion/repositorioBoletas';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { archivoSubido } from '@/compartido/componentes/BotonArchivo';
import { fechaLarga, momento } from '@/compartido/almacen/crearAlmacen';
import { buscarTrabajador } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { nombreLegible } from '@/modulos/trabajadores/dominio/trabajador';
import { etiquetaTipo, ultimoEvento, type Documento, type EventoDocumento } from '../dominio/documento';
import { adendaVendedorDeContrato, armarAdenda, type DatosAdenda } from '../dominio/plantillaAdenda';
import { armarContrato } from '../dominio/plantillaContrato';

const TEXTOS: Record<Documento['tipo'], (n: string, dni: string, cargo: string, area: string, ingreso: string) => string[]> = {
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
  epp: (n, dni) => [
    `Yo, ${n}, con DNI ${dni}, declaro haber recibido los equipos de protección personal: casco, lentes, guantes y zapatos de seguridad, en buen estado.`,
    'Me comprometo a usarlos correctamente y a comunicar su deterioro.',
  ],
  domicilio: (n, dni) => [`Yo, ${n}, con DNI ${dni}, declaro bajo juramento que mi domicilio actual es el registrado en mi ficha de personal.`],
};

/**
 * Marca de agua: /marca-agua.png si existe en `public` (el logo tenue de Gestión Humana);
 * si no, el logo de la empresa atenuado.
 */
function MarcaAgua() {
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
function EspacioFirmaTrabajador({ firma }: { firma?: EventoDocumento }) {
  const control = useContext(ContextoFirmar);
  if (firma) return <FirmaTrabajador evento={firma} />;
  return control ? <LienzoFirma control={control} /> : null;
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

/** Vista previa del documento: el archivo subido o el texto generado desde la plantilla. */
interface PropiedadesVista {
  documento: Documento | null;
  visible: boolean;
  alCerrar: () => void;
  /** Trabajador firmando: dibuja su firma sobre su línea del documento y confirma. */
  alFirmar?: (imagen: string) => void;
}

export function VistaDocumento({ documento: d, visible, alCerrar, alFirmar }: PropiedadesVista) {
  const archivo = d?.origen.tipo === 'archivo' ? archivoSubido(d.origen.nombre) : undefined;
  const t = d ? buscarTrabajador(d.dni) : undefined;
  const firma = d ? ultimoEvento(d, 'firmado') : undefined;
  const visor = useRef<HTMLDivElement>(null);
  const control = useControlFirma();
  const { borrar } = control;
  const [zoom, setZoom] = useState(1);
  const firmando = !!alFirmar && !firma;

  useEffect(() => {
    if (visible) {
      borrar();
      setZoom(1);
    }
  }, [visible, borrar]);

  return (
    <Dialog
      visible={visible && !!d}
      onHide={alCerrar}
      header={
        d && (
          <div className="pp-ventana__titulo">
            <span>{etiquetaTipo(d.tipo)}</span>
            <small>
              N° {d.numero} · versión {d.version}
            </small>
          </div>
        )
      }
      className="pp-ventana dm-ventana-documento"
      style={{ width: '820px' }}
      breakpoints={{ '860px': '100vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          {!firmando && (
            <Button
              label={archivo ? 'Descargar' : 'Descargar PDF'}
              icon="pi pi-download"
              outlined
              className="pp-boton-secundario"
              onClick={() =>
                archivo
                  ? window.open(archivo.url, '_blank', 'noopener')
                  : d && void guardarComoPdf(visor.current, nombreArchivo(etiquetaTipo(d.tipo), `N° ${d.numero}`, d.trabajador))
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
      <ContextoFirmar.Provider value={firmando ? control : null}>
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
        ) : d?.adenda ? (
          <HojaAdenda datos={d.adenda} firma={firma} />
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
              {TEXTOS[d.tipo](
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
      {firmando && (
        <BarraFirma
          control={control}
          zoom={zoom}
          alCambiarZoom={setZoom}
          alEnviar={() => {
            const imagen = control.imagen();
            if (imagen) alFirmar?.(imagen);
          }}
        />
      )}
    </Dialog>
  );
}
