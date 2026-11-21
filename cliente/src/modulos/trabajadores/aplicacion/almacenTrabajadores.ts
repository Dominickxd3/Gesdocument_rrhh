import { ahoraIso, crearAlmacen, hoyIso } from '@/compartido/almacen/crearAlmacen';
import type { Trabajador } from '../dominio/trabajador';
import { crearTrabajadores } from '../infraestructura/datosTrabajadores';

/** Lista de trabajadores compartida por todos los módulos del prototipo. */
export const almacenTrabajadores = crearAlmacen(() => ({
  lista: crearTrabajadores(),
  /** Última sincronización con el ERP (simulada). */
  sincronizado: ahoraIso(),
}));

export const useTrabajadores = () => almacenTrabajadores.usar().lista;

export const buscarTrabajador = (dni: string | undefined) => almacenTrabajadores.leer().lista.find((t) => t.dni === dni);

/** Edita los datos de contacto y el jefe inmediato; si cambia el jefe, queda en el historial (RF02). */
export function editarTrabajador(dni: string, cambios: Pick<Trabajador, 'correo' | 'telefono' | 'jefe'>) {
  almacenTrabajadores.escribir((e) => ({
    ...e,
    lista: e.lista.map((t) =>
      t.dni !== dni
        ? t
        : {
            ...t,
            ...cambios,
            historialJefes: cambios.jefe !== t.jefe ? [...t.historialJefes, { jefe: cambios.jefe, desde: hoyIso() }] : t.historialJefes,
          },
    ),
  }));
}

/** Mi perfil: el propio trabajador actualiza solo sus datos personales de contacto. */
export function actualizarContacto(dni: string, cambios: Pick<Trabajador, 'correo' | 'telefono'>) {
  almacenTrabajadores.escribir((e) => ({ ...e, lista: e.lista.map((t) => (t.dni === dni ? { ...t, ...cambios } : t)) }));
}

/** Simula la sincronización con el ERP (RF01): en producción trae altas, bajas y cambios. */
export async function sincronizarConErp(): Promise<number> {
  await new Promise((r) => setTimeout(r, 1200));
  almacenTrabajadores.escribir((e) => ({ ...e, sincronizado: ahoraIso() }));
  return almacenTrabajadores.leer().lista.length;
}
