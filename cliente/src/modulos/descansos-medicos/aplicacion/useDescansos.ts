import { SIN_RANGO, mesActualHastaHoy, periodoEnRango, type RangoFechas } from '@/compartido/componentes/FiltroFechas';
import { ordenarPorTrabajador } from '@/compartido/formato/orden';
import { useCallback, useMemo, useState } from 'react';
import { leerFiltroDeEnlace } from '@/compartido/navegacion/filtroDeEnlace';
import type { EstadoDescanso } from '../dominio/descanso';
import { useListaDescansos } from './almacenDescansos';

export interface FiltrosDescansos {
  busqueda: string;
  area: string | null;
  estado: EstadoDescanso | 'todos';
  /** Periodos que se cruzan con este rango. */
  fechas: RangoFechas;
}

/** Al entrar se ven todos; las pendientes de revisión se distinguen por su franja ámbar. */
const FILTROS_INICIALES: FiltrosDescansos = { busqueda: '', area: null, estado: 'todos', fechas: SIN_RANGO };

/** Lista y filtros de la vista de RR. HH. Los datos vienen del almacén compartido. */
export function useDescansos() {
  const descansos = useListaDescansos();
  // Si se llega desde el Inicio, ya viene filtrado por trabajador y periodo.
  const [filtros, setFiltros] = useState<FiltrosDescansos>(() => {
    const e = leerFiltroDeEnlace();
    return { ...FILTROS_INICIALES, busqueda: e.dni ?? '', fechas: e.desde ? { desde: e.desde, hasta: e.hasta ?? null } : mesActualHastaHoy() };
  });

  const actualizarFiltros = useCallback((c: Partial<FiltrosDescansos>) => setFiltros((f) => ({ ...f, ...c })), []);
  const limpiarFiltros = useCallback(() => setFiltros(FILTROS_INICIALES), []);

  const sinFiltroEstado = useMemo(() => {
    const q = filtros.busqueda.trim().toLowerCase();
    return descansos.filter((d) => {
      if (filtros.area && d.trabajador.area !== filtros.area) return false;
      if (!periodoEnRango(d.inicio, d.fin, filtros.fechas)) return false;
      if (q && !`${d.numero} ${d.trabajador.nombre} ${d.trabajador.dni}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [descansos, filtros.area, filtros.busqueda, filtros.fechas]);

  const visibles = useMemo(
    () =>
      ordenarPorTrabajador(
        filtros.estado === 'todos' ? sinFiltroEstado : sinFiltroEstado.filter((d) => d.estado === filtros.estado),
        (d) => d.trabajador.nombre,
        (d) => d.numero,
      ),
    [sinFiltroEstado, filtros.estado],
  );

  const conteo = useMemo(() => {
    const c: Record<EstadoDescanso | 'todos', number> = {
      todos: sinFiltroEstado.length,
      aviso: 0,
      pendiente_revision: 0,
      observado: 0,
      aprobado: 0,
      rechazado: 0,
    };
    for (const d of sinFiltroEstado) c[d.estado]++;
    return c;
  }, [sinFiltroEstado]);

  return { descansos, visibles, filtros, conteo, actualizarFiltros, limpiarFiltros };
}
