import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSesion } from './ContextoSesion';

/** Redirige al inicio de sesión si no hay usuario, recordando a dónde quería ir. */
export function RutaProtegida({ children }: { children: ReactNode }) {
  const { usuario } = useSesion();
  const ubicacion = useLocation();

  if (!usuario) {
    return <Navigate to="/iniciar-sesion" replace state={{ desde: ubicacion.pathname }} />;
  }
  return <>{children}</>;
}
