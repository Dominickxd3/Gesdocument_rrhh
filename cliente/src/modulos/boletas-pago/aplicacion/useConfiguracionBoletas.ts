import { useCallback, useEffect, useState } from 'react';
import type { ConfiguracionBoletas, RepositorioBoletas } from '../dominio/boleta';

/** Lectura y edición de la configuración que comparten todas las boletas (empresa y firma del empleador). */
export function useConfiguracionBoletas(repositorio: RepositorioBoletas) {
  const [configuracion, setConfiguracion] = useState<ConfiguracionBoletas | null>(null);

  useEffect(() => {
    void repositorio.obtenerConfiguracion().then(setConfiguracion);
  }, [repositorio]);

  const guardar = useCallback(
    async (nueva: ConfiguracionBoletas) => {
      await repositorio.guardarConfiguracion(nueva);
      setConfiguracion(nueva);
    },
    [repositorio],
  );

  return { configuracion, guardar };
}
