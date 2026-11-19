import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { archivoSubido } from '@/compartido/componentes/BotonArchivo';
import { fechaLarga, momento } from '@/compartido/almacen/crearAlmacen';
import { buscarTrabajador } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { nombreLegible } from '@/modulos/trabajadores/dominio/trabajador';
import { etiquetaTipo, ultimoEvento, type Documento } from '../dominio/documento';

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

/** Vista previa del documento: el archivo subido o el texto generado desde la plantilla. */
export function VistaDocumento({ documento: d, visible, alCerrar }: { documento: Documento | null; visible: boolean; alCerrar: () => void }) {
  const archivo = d?.origen.tipo === 'archivo' ? archivoSubido(d.origen.nombre) : undefined;
  const t = d ? buscarTrabajador(d.dni) : undefined;
  const firma = d ? ultimoEvento(d, 'firmado') : undefined;

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
          <Button label="Descargar" icon="pi pi-download" text onClick={() => (archivo ? window.open(archivo.url, '_blank', 'noopener') : window.print())} />
          <span className="pp-espaciador" />
          <Button label="Cerrar" className="pp-boton-principal" onClick={alCerrar} />
        </div>
      }
    >
      <div className="dm-visor">
        {d && archivo ? (
          archivo.tipo.startsWith('image/') ? <img src={archivo.url} alt="" /> : <iframe src={archivo.url} title={etiquetaTipo(d.tipo)} />
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
                  {firma ? <em className="doc-hoja__firmado">Firmado electrónicamente · {momento(firma.fecha)}</em> : <span />}
                  {nombreLegible(d.trabajador)}
                </div>
              </div>
            </article>
          )
        )}
      </div>
    </Dialog>
  );
}
