import { crearAlmacen } from '@/compartido/almacen/crearAlmacen';
import { ahoraLocal } from '@/compartido/formato/fechas';
import type { DatosAviso } from '../dominio/descanso';
import { registrarAviso } from './almacenDescansos';

/**
 * Aviso que el trabajador guardó sin enviar. Solo él lo ve: puede editarlo o eliminarlo
 * mientras no lo envíe. Una vez enviado pasa a RR. HH. y ya no se puede modificar.
 */
export interface BorradorDescanso {
  id: string;
  datos: DatosAviso;
  actualizado: string;
}

const almacen = crearAlmacen<BorradorDescanso[]>(() => []);
let correlativo = 0;

/** Borradores del trabajador (RNF01: cada uno ve solo los suyos). */
export const useBorradoresDe = (dni: string | undefined) => almacen.usar().filter((b) => b.datos.trabajador.dni === dni);

/** Crea el borrador o actualiza uno existente; devuelve su id. */
export function guardarBorrador(datos: DatosAviso, id?: string): string {
  const actualizado = ahoraLocal();
  if (id) {
    almacen.escribir((lista) => lista.map((b) => (b.id === id ? { ...b, datos, actualizado } : b)));
    return id;
  }
  const nuevo = { id: `borrador-${++correlativo}`, datos, actualizado };
  almacen.escribir((lista) => [nuevo, ...lista]);
  return nuevo.id;
}

export const eliminarBorrador = (id: string) => almacen.escribir((lista) => lista.filter((b) => b.id !== id));

/** Envía el aviso a RR. HH.; si venía de un borrador, el borrador desaparece. Devuelve el N° del descanso. */
export function enviarAviso(datos: DatosAviso, usuario: string, idBorrador?: string): number {
  if (idBorrador) eliminarBorrador(idBorrador);
  return registrarAviso(datos, usuario);
}
