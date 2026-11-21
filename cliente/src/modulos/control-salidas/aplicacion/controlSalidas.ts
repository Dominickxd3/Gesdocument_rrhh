import type { Papeleta } from '@/modulos/papeletas-permiso/dominio/papeleta';

/** Quién y cuándo aprobó la papeleta en RR. HH. (la última aprobación del historial). */
export const autorizacionDe = (p: Papeleta) => [...p.historial].reverse().find((h) => h.accion === 'aprobada');

/**
 * CUS17: Seguridad solo ve papeletas aprobadas por RR. HH., de su sede y de la fecha consultada.
 * Las pendientes, rechazadas o anuladas no le aparecen.
 */
export function papeletasAutorizadas(papeletas: Papeleta[], fecha: string, sede: string | null, busqueda: string) {
  const q = busqueda.trim().toLowerCase();
  return papeletas
    .filter(
      (p) =>
        p.estado === 'aprobada' &&
        p.fecha === fecha &&
        (!sede || p.trabajador.sede === sede) &&
        (!q || `${p.numero} ${p.trabajador.nombre} ${p.trabajador.dni}`.toLowerCase().includes(q)),
    )
    .sort((a, b) => a.salida.localeCompare(b.salida));
}
