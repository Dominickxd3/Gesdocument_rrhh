import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { borrarSesion, guardarSesion, leerSesion } from './almacenSesion';
import type { Credenciales, ServicioAutenticacion, UsuarioSesion } from './tipos';

interface ValorContextoSesion {
  usuario: UsuarioSesion | null;
  iniciarSesion: (credenciales: Credenciales, recordar: boolean) => Promise<void>;
  cerrarSesion: () => void;
}

const ContextoSesion = createContext<ValorContextoSesion | null>(null);

interface PropiedadesProveedorSesion {
  /** Implementación inyectada: local para el mockup, HTTP cuando exista el servidor. */
  servicio: ServicioAutenticacion;
  children: ReactNode;
}

export function ProveedorSesion({ servicio, children }: PropiedadesProveedorSesion) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(leerSesion);

  const iniciarSesion = useCallback(
    async (credenciales: Credenciales, recordar: boolean) => {
      const usuarioValidado = await servicio.iniciarSesion(credenciales);
      guardarSesion(usuarioValidado, recordar);
      setUsuario(usuarioValidado);
    },
    [servicio],
  );

  const cerrarSesion = useCallback(() => {
    borrarSesion();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, iniciarSesion, cerrarSesion }),
    [usuario, iniciarSesion, cerrarSesion],
  );

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export function useSesion(): ValorContextoSesion {
  const contexto = useContext(ContextoSesion);
  if (!contexto) throw new Error('useSesion debe usarse dentro de ProveedorSesion.');
  return contexto;
}

/** Usuario en sesión; solo para pantallas protegidas, donde siempre existe. */
export function useUsuarioActual(): UsuarioSesion {
  const { usuario } = useSesion();
  if (!usuario) throw new Error('No hay un usuario en sesión.');
  return usuario;
}
