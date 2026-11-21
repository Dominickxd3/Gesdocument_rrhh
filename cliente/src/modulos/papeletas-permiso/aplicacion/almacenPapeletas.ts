import { crearAlmacen } from '@/compartido/almacen/crearAlmacen';
import { ahoraLocal } from '@/compartido/formato/fechas';
import { crearPapeletasPrueba } from '../infraestructura/datosPrueba';

/**
 * Papeletas compartidas entre pantallas: lo que RR. HH. aprueba lo ve Seguridad al instante.
 * En memoria para el prototipo; en producción vendrá del servidor.
 */
export const almacenPapeletas = crearAlmacen(crearPapeletasPrueba);

export const usePapeletasCompartidas = () => almacenPapeletas.usar();

/** CUS18: Seguridad registra que verificó la papeleta y la hora en que el trabajador salió. */
export function registrarSalida(id: string, hora: string, usuario: string, nota?: string) {
  almacenPapeletas.escribir((lista) =>
    lista.map((p) =>
      p.id === id ? { ...p, controlSalida: { hora, usuario, registrado: ahoraLocal(), nota: nota?.trim() || undefined } } : p,
    ),
  );
}
