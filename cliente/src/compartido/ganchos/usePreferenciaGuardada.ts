import { useCallback, useState } from 'react';

const PREFIJO_CLAVE = 'gesdocument-rrhh:';

function leer<T>(clave: string): T | undefined {
  try {
    const valor = localStorage.getItem(PREFIJO_CLAVE + clave);
    return valor === null ? undefined : (JSON.parse(valor) as T);
  } catch {
    return undefined;
  }
}

function escribir<T>(clave: string, valor: T): void {
  try {
    localStorage.setItem(PREFIJO_CLAVE + clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento disponible (modo privado): la preferencia dura solo esta visita.
  }
}

/**
 * Estado que se guarda en el navegador y se recupera en la siguiente visita.
 * Devuelve `undefined` mientras el usuario no haya elegido nada.
 */
export function usePreferenciaGuardada<T>(clave: string) {
  const [valor, setValor] = useState<T | undefined>(() => leer<T>(clave));

  const guardar = useCallback(
    (nuevoValor: T) => {
      setValor(nuevoValor);
      escribir(clave, nuevoValor);
    },
    [clave],
  );

  return [valor, guardar] as const;
}
