import { Button } from 'primereact/button';
import { Insignia } from '@/compartido/componentes/Insignia';
import { fechaCorta, fechaLarga } from '@/compartido/almacen/crearAlmacen';
import { iniciales, nombreLegible } from '@/modulos/trabajadores/dominio/trabajador';
import {
  CATEGORIAS_EXPEDIENTE,
  TIPOS_REQUERIDOS,
  etiquetaTipo,
  infoEstado,
  resumirExpediente,
  situacionRequisito,
  type Documento,
  type TipoDocumento,
} from '../dominio/documento';
import './expediente.css';

export interface DatosFicha {
  nombre: string;
  dni: string;
  cargo: string;
  area: string;
  sede?: string;
  fechaIngreso?: string;
}

interface Propiedades {
  ficha: DatosFicha;
  documentos: Documento[];
  modo: 'rrhh' | 'trabajador';
  alAbrir: (documento: Documento) => void;
  /** Solo RR. HH.: preparar un documento requerido que falta. */
  alPreparar?: (tipo: TipoDocumento) => void;
}

const fechaDe = (d: Documento) => d.historial[d.historial.length - 1].fecha;

/** Expediente digital de un trabajador (RF03, CUS40/CUS45): ficha, requeridos y documentos por categoría. */
export function ExpedienteTrabajador({ ficha, documentos, modo, alAbrir, alPreparar }: Propiedades) {
  const resumen = resumirExpediente(documentos);
  const avance = Math.round((resumen.requeridosCompletos / resumen.requeridosTotal) * 100);

  return (
    <div className="expediente">
      <section className="expediente__ficha">
        <span className="expediente__avatar" aria-hidden="true">{iniciales(ficha.nombre)}</span>
        <div className="expediente__persona">
          <h2>{nombreLegible(ficha.nombre)}</h2>
          <p>
            DNI {ficha.dni} · {ficha.cargo} · {ficha.area}
            {ficha.sede && ` · ${ficha.sede}`}
          </p>
          {ficha.fechaIngreso && <p className="expediente__ingreso">Ingresó el {fechaLarga(ficha.fechaIngreso)}</p>}
        </div>
        <div className="expediente__avance" aria-label={`${resumen.requeridosCompletos} de ${resumen.requeridosTotal} documentos requeridos firmados`}>
          <div className="expediente__avance-cifra">
            <strong>
              {resumen.requeridosCompletos}/{resumen.requeridosTotal}
            </strong>
            <span>requeridos firmados</span>
          </div>
          <div className="expediente__barra">
            <span style={{ width: `${avance}%` }} />
          </div>
          <div className="expediente__contadores">
            {resumen.pendientesFirma > 0 && <Insignia tono="ambar">{resumen.pendientesFirma} por firmar</Insignia>}
            {resumen.observados > 0 && <Insignia tono="azul">{resumen.observados} observado{resumen.observados > 1 ? 's' : ''}</Insignia>}
            {resumen.pendientesFirma === 0 && resumen.observados === 0 && <Insignia tono="gris">Sin pendientes</Insignia>}
          </div>
        </div>
      </section>

      <section className="expediente__seccion">
        <h3>Documentos requeridos</h3>
        <ul className="expediente__requeridos">
          {TIPOS_REQUERIDOS.map((tipo) => {
            const { situacion, documento } = situacionRequisito(documentos, tipo);
            return (
              <li key={tipo} className={`es-${situacion}`}>
                <i
                  className={situacion === 'firmado' ? 'pi pi-check-circle' : situacion === 'en_curso' ? 'pi pi-clock' : 'pi pi-circle'}
                  aria-hidden="true"
                />
                <div className="expediente__requerido-texto">
                  <strong>{etiquetaTipo(tipo)}</strong>
                  <span>
                    {situacion === 'firmado' && documento && `Firmado · N° ${documento.numero} · ${fechaCorta(fechaDe(documento))}`}
                    {situacion === 'en_curso' && documento && `${infoEstado(documento.estado).etiqueta} · N° ${documento.numero}`}
                    {situacion === 'falta' && (modo === 'rrhh' ? 'Falta en el expediente' : 'RR. HH. lo preparará')}
                  </span>
                </div>
                {documento ? (
                  <Button label="Ver" text size="small" className="pp-boton-texto" onClick={() => alAbrir(documento)} />
                ) : (
                  modo === 'rrhh' &&
                  alPreparar && (
                    <Button label="Preparar" icon="pi pi-plus" size="small" outlined className="pp-boton-secundario" onClick={() => alPreparar(tipo)} />
                  )
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {CATEGORIAS_EXPEDIENTE.map((categoria) => {
        const deCategoria = documentos
          .filter((d) => categoria.tipos.includes(d.tipo))
          .sort((a, b) => fechaDe(b).localeCompare(fechaDe(a)));
        return (
          <section key={categoria.id} className="expediente__seccion">
            <h3>
              <i className={categoria.icono} aria-hidden="true" /> {categoria.titulo}
              <span className="expediente__cantidad">{deCategoria.length}</span>
            </h3>
            {deCategoria.length === 0 ? (
              <p className="expediente__vacio">Sin documentos en esta sección.</p>
            ) : (
              <ul className="expediente__documentos">
                {deCategoria.map((d) => (
                  <li key={d.id}>
                    <button type="button" onClick={() => alAbrir(d)}>
                      <i className="pi pi-file" aria-hidden="true" />
                      <span className="expediente__documento-titulo">
                        <strong>{etiquetaTipo(d.tipo)}</strong>
                        <small>
                          N° {d.numero} · versión {d.version} · {fechaCorta(fechaDe(d))}
                        </small>
                      </span>
                      <Insignia tono={infoEstado(d.estado).tono}>{infoEstado(d.estado).etiqueta}</Insignia>
                      <i className="pi pi-angle-right expediente__flecha" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
