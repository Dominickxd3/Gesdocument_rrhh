import { useSyncExternalStore } from 'react';
import { avisarCambioContadores } from '@/compartido/navegacion/contadores';

/**
 * Almacén en memoria para los prototipos: compartido entre pantallas y usuarios
 * mientras la página no se recargue. En producción se reemplaza por llamadas al servidor.
 */
export function crearAlmacen<T>(inicial: () => T) {
  let estado = inicial();
  const suscriptores = new Set<() => void>();

  const suscribir = (avisar: () => void) => {
    suscriptores.add(avisar);
    return () => suscriptores.delete(avisar);
  };

  return {
    leer: () => estado,
    escribir(siguiente: T | ((actual: T) => T)) {
      estado = typeof siguiente === 'function' ? (siguiente as (a: T) => T)(estado) : siguiente;
      suscriptores.forEach((avisar) => avisar());
      avisarCambioContadores();
    },
    usar: () => useSyncExternalStore(suscribir, () => estado),
  };
}

export const ahoraIso = () => new Date().toISOString();
export const hoyIso = () => new Date().toISOString().slice(0, 10);

const formatoCorto = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' });
const formatoMomento = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const formatoLargo = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

/** 2026-11-19 → 19-nov */
export const fechaCorta = (iso: string) => formatoCorto.format(new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)).replace('.', '');
/** ISO → 19-nov, 09:20 a. m. */
export const momento = (iso: string) => formatoMomento.format(new Date(iso));
/** 2026-11-19 → 19/11/2026 */
export const fechaLarga = (iso: string) => formatoLargo.format(new Date(iso.length === 10 ? `${iso}T12:00:00` : iso));

/** Generador pseudoaleatorio con semilla (datos ficticios estables). */
export function crearAleatorio(semilla: number) {
  let s = semilla;
  const azar = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { azar, elegir: <V,>(lista: V[]) => lista[Math.floor(azar() * lista.length)] };
}

export function haceDias(dias: number, hora = '09:00') {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return `${d.toISOString().slice(0, 10)}T${hora}:00`;
}
