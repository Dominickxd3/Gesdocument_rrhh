import { useNavigate } from 'react-router-dom';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { esGestor } from '@/compartido/sesion/tipos';
import { useContador } from '@/compartido/navegacion/contadores';
import { pendientesDe } from '@/aplicacion/pendientes';
import '@/compartido/estilos/listados';

const ACCESOS_TRABAJADOR = [
  { ruta: '/boletas-pago', icono: 'pi pi-wallet', titulo: 'Boletas de pago', detalle: 'Revisa y firma tus boletas' },
  { ruta: '/papeletas-permiso', icono: 'pi pi-clock', titulo: 'Papeletas de permiso', detalle: 'Tus salidas durante la jornada' },
];

const ACCESOS_RRHH = [
  { ruta: '/trabajadores', icono: 'pi pi-users', titulo: 'Trabajadores', detalle: 'Fichas, jefaturas y expedientes' },
  { ruta: '/papeletas-permiso', icono: 'pi pi-clock', titulo: 'Papeletas de permiso', detalle: 'Aprobar salidas del día' },
  { ruta: '/reportes', icono: 'pi pi-chart-bar', titulo: 'Reportes', detalle: 'Exportaciones y trazabilidad' },
];

/** Inicio: lo que el usuario tiene por atender hoy y accesos directos. Sin indicadores decorativos. */
export function PaginaInicio() {
  const usuario = useUsuarioActual();
  const navegar = useNavigate();
  // Se vuelve a dibujar cuando cambian los datos de los módulos.
  useContador('/documentos', usuario);
  const pendientes = pendientesDe(usuario);
  const conPendientes = pendientes.filter((p) => p.cantidad > 0);
  const accesos = esGestor(usuario) ? ACCESOS_RRHH : ACCESOS_TRABAJADOR;
  const nombre = usuario.nombre.split(' ')[0];

  return (
    <div className="inicio">
      <header>
        <h1>Hola, {nombre}</h1>
        <p className="inicio__saludo">
          {conPendientes.length ? 'Esto es lo que tienes por atender.' : 'No tienes pendientes por ahora.'}
        </p>
      </header>

      <section className="inicio__seccion">
        <h2>Por atender</h2>
        <ul className="inicio__lista">
          {pendientes.map((p) => (
            <li key={p.ruta}>
              <button type="button" className="inicio__item" onClick={() => navegar(p.ruta)}>
                <i className={p.icono} aria-hidden="true" />
                <div>
                  <strong>{p.titulo}</strong>
                  <small>{p.detalle}</small>
                </div>
                <span className={`inicio__numero${p.cantidad ? '' : ' es-cero'}`}>{p.cantidad}</span>
                <i className="pi pi-angle-right" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="inicio__seccion">
        <h2>Accesos</h2>
        <ul className="inicio__lista">
          {accesos.map((a) => (
            <li key={a.ruta}>
              <button type="button" className="inicio__item" onClick={() => navegar(a.ruta)}>
                <i className={a.icono} aria-hidden="true" />
                <div>
                  <strong>{a.titulo}</strong>
                  <small>{a.detalle}</small>
                </div>
                <i className="pi pi-angle-right" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
