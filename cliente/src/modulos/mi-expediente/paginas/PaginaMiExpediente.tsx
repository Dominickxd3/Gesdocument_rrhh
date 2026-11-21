import { NavLink, Outlet } from 'react-router-dom';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { useContador } from '@/compartido/navegacion/contadores';
import type { UsuarioSesion } from '@/compartido/sesion/tipos';
import './miExpediente.css';

/** Secciones del expediente del trabajador; cada una muestra solo sus propios datos (RNF01). */
const SECCIONES = [
  { ruta: '/mi-expediente/documentos', etiqueta: 'Documentos', icono: 'pi pi-file' },
  { ruta: '/mi-expediente/boletas', etiqueta: 'Boletas de pago', icono: 'pi pi-wallet' },
  { ruta: '/mi-expediente/descansos-medicos', etiqueta: 'Descansos médicos', icono: 'pi pi-heart' },
  { ruta: '/mi-expediente/memorandums', etiqueta: 'Memorándums', icono: 'pi pi-exclamation-triangle' },
];

function Pestana({ ruta, etiqueta, icono, usuario }: (typeof SECCIONES)[number] & { usuario: UsuarioSesion }) {
  const pendientes = useContador(ruta, usuario);
  return (
    <NavLink to={ruta} className="mi-expediente__pestana">
      <i className={icono} aria-hidden="true" />
      <span>{etiqueta}</span>
      {pendientes > 0 && <span className="mi-expediente__pendientes">{pendientes}</span>}
    </NavLink>
  );
}

/**
 * "Mi expediente" del trabajador (RF03): agrupa en un solo apartado sus documentos laborales,
 * boletas de pago, descansos médicos y memorándums. RR. HH. y administrador usan las pantallas de gestión.
 */
export function PaginaMiExpediente() {
  const usuario = useUsuarioActual();
  return (
    <div className="mi-expediente">
      <header className="mi-expediente__encabezado">
        <h1>Mi expediente</h1>
        <p>Todo lo tuyo en un solo lugar: documentos, boletas, descansos médicos y memorándums.</p>
      </header>

      <nav className="mi-expediente__pestanas" aria-label="Secciones de mi expediente">
        {SECCIONES.map((s) => (
          <Pestana key={s.ruta} {...s} usuario={usuario} />
        ))}
      </nav>

      <div className="mi-expediente__contenido">
        <Outlet />
      </div>
    </div>
  );
}
