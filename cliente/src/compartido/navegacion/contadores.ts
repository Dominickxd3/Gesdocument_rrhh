import { useSyncExternalStore } from 'react';
import type { UsuarioSesion } from '@/compartido/sesion/tipos';

/**
 * Contadores de pendientes de la barra lateral (el número junto a cada enlace).
 * Cada módulo registra cómo contar lo que el usuario tiene por atender y avisa cuando sus datos cambian.
 * El registro se hace en `aplicacion/contadoresNavegacion.ts` para que `compartido` no dependa de los módulos.
 */
type Contador = (usuario: UsuarioSesion) => number;

const contadores = new Map<string, Contador>();
const suscriptores = new Set<() => void>();
let version = 0;

export function registrarContador(ruta: string, contar: Contador) {
  contadores.set(ruta, contar);
}

/** Los módulos llaman a esto cuando cambian sus datos. */
export function avisarCambioContadores() {
  version++;
  suscriptores.forEach((avisar) => avisar());
}

const suscribir = (avisar: () => void) => {
  suscriptores.add(avisar);
  return () => suscriptores.delete(avisar);
};

/** Pendientes de una ruta para el usuario en sesión; 0 si el módulo no registró contador. */
export function useContador(ruta: string, usuario: UsuarioSesion): number {
  useSyncExternalStore(suscribir, () => version);
  return contadores.get(ruta)?.(usuario) ?? 0;
}
