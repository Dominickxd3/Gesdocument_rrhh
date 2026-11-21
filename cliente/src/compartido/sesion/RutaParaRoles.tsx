import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUsuarioActual } from './ContextoSesion';
import { esGestor, rolDe, rutaInicialPara, type Rol } from './tipos';

/** Muestra la pantalla solo a los roles indicados; los demás vuelven a su pantalla inicial (RNF01). */
export function RutaParaRoles({ roles, children }: { roles: Rol[]; children: ReactNode }) {
  const rol = rolDe(useUsuarioActual());
  return roles.includes(rol) ? <>{children}</> : <Navigate to={rutaInicialPara(rol)} replace />;
}

/** RR. HH. y administrador ven la pantalla de gestión; el trabajador va a su sección de "Mi expediente". */
export function SoloGestores({ rutaTrabajador, children }: { rutaTrabajador: string; children: ReactNode }) {
  return esGestor(useUsuarioActual()) ? <>{children}</> : <Navigate to={rutaTrabajador} replace />;
}

/** Envía a cada rol a su pantalla inicial (la raíz y las rutas desconocidas). */
export function RedireccionInicial() {
  return <Navigate to={rutaInicialPara(rolDe(useUsuarioActual()))} replace />;
}
