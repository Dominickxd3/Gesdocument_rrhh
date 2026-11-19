import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUsuarioActual } from './ContextoSesion';
import { esGestor } from './tipos';

/** Pantallas solo para RR. HH. y administrador; el trabajador vuelve al inicio. */
export function RutaSoloGestores({ children }: { children: ReactNode }) {
  const usuario = useUsuarioActual();
  return esGestor(usuario) ? <>{children}</> : <Navigate to="/inicio" replace />;
}
