import type { ReactNode, Ref } from 'react';
import type { ControlFirma } from '@/compartido/componentes/LienzoFirma';
import { fechaLarga, momento } from '@/compartido/almacen/crearAlmacen';
import { buscarTrabajador } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { iniciales, nombreLegible } from '@/modulos/trabajadores/dominio/trabajador';
import { formatearHora, type Papeleta } from '../dominio/papeleta';
import { CopiaPapeleta } from './VentanaImpresion';
import './papeletas.css';
import './detallePapeleta.css';

interface Propiedades {
  papeleta: Papeleta;
  /** Copia que se muestra: "Copia para Colaborador" o "Copia para Vigilancia". */
  copia: string;
  /** La hoja de la papeleta, para descargarla en PDF. */
  refHoja?: Ref<HTMLElement>;
  /** Sección final de la columna derecha (control de salida). */
  children?: ReactNode;
  /** El colaborador está firmando su papeleta. */
  controlFirma?: ControlFirma;
  /** Contenido justo debajo de la hoja (p. ej. la barra de firma). */
  bajoLaHoja?: ReactNode;
}

/** Última aprobación de RR. HH. en el historial. */
export const aprobacionDe = (p: Papeleta) => [...p.historial].reverse().find((h) => h.accion === 'aprobada');

/**
 * Papeleta detallada: autorización de RR. HH., la papeleta en formato oficial y los datos del colaborador.
 * La ven igual el trabajador (para mostrarla al salir) y Seguridad (que la evalúa y registra la salida).
 */
export function DetallePapeleta({ papeleta, copia, refHoja, children, controlFirma, bajoLaHoja }: Propiedades) {
  const aprobacion = aprobacionDe(papeleta);
  const ficha = buscarTrabajador(papeleta.trabajador.dni);
  // El jefe inmediato es quien registró la papeleta; la ficha lo confirma si existe.
  const jefe = ficha?.jefe ?? papeleta.historial.find((h) => h.accion === 'creada')?.usuario;

  const colaborador = [
    { etiqueta: 'DNI', valor: papeleta.trabajador.dni },
    { etiqueta: 'Cargo', valor: papeleta.trabajador.cargo },
    { etiqueta: 'Área', valor: papeleta.trabajador.area },
    { etiqueta: 'Sede', valor: ficha?.sede ?? papeleta.trabajador.sede ?? '' },
    { etiqueta: 'Jefe inmediato', valor: jefe ? nombreLegible(jefe) : '' },
    { etiqueta: 'Teléfono', valor: ficha?.telefono ?? '' },
  ].filter((d) => d.valor);

  return (
    <div className="dp-detalle">
      {aprobacion && (
        <div className="dp-verificacion">
          <i className="pi pi-verified" aria-hidden="true" />
          <div>
            <strong>Autorizada por RR. HH.</strong>
            <span>
              {aprobacion.usuario} · {momento(aprobacion.fecha)}
            </span>
          </div>
        </div>
      )}

      <div className="dp-cuerpo">
        <section aria-label="Papeleta">
          <h3 className="dp-titulo-seccion">Papeleta</h3>
          <article className="pp-hoja papel-A5 dp-hoja" ref={refHoja}>
            <div className="pp-hoja__cuerpo">
              <CopiaPapeleta p={papeleta} copia={copia} controlFirma={controlFirma} />
            </div>
          </article>
          {bajoLaHoja}
        </section>

        <div className="dp-lateral">
          <section aria-label="Detalle del colaborador">
            <h3 className="dp-titulo-seccion">Detalle del colaborador</h3>
            <div className="dp-colaborador">
              <span className="dp-colaborador__avatar" aria-hidden="true">{iniciales(papeleta.trabajador.nombre)}</span>
              <div>
                <strong>{nombreLegible(papeleta.trabajador.nombre)}</strong>
                <span>{fechaLarga(papeleta.fecha)}</span>
              </div>
            </div>
            <dl className="dp-datos">
              {colaborador.map(({ etiqueta, valor }) => (
                <div key={etiqueta}>
                  <dt>{etiqueta}</dt>
                  <dd>{valor}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-label="Control de salida">
            <h3 className="dp-titulo-seccion">Control de salida</h3>
            <p className="dp-horario">
              Autorizada de <strong>{formatearHora(papeleta.salida)}</strong>{' '}
              {papeleta.retorno ? (
                <>
                  a <strong>{formatearHora(papeleta.retorno)}</strong>
                </>
              ) : (
                'sin retorno en el día'
              )}
            </p>
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
