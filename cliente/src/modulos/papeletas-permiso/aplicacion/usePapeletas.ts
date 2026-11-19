import { useCallback, useMemo, useState } from 'react';
import type {
  DatosPapeleta,
  EventoHistorial,
  FiltroEstado,
  Papeleta,
  ResumenPapeletas,
  TipoPermiso,
} from '../dominio/papeleta';
import { HOY, crearPapeletasPrueba } from '../infraestructura/datosPrueba';

export interface FiltrosPapeletas {
  busqueda: string;
  area: string | null;
  tipo: TipoPermiso | null;
  estado: FiltroEstado;
  /** 'hoy' | 'semana' | 'todo' */
  rango: 'hoy' | 'semana' | 'todo';
  verAnuladas: boolean;
}

const FILTROS_INICIALES: FiltrosPapeletas = {
  busqueda: '',
  area: null,
  tipo: null,
  estado: 'todas',
  rango: 'todo',
  verAnuladas: false,
};

const USUARIO_ACTUAL = 'Usted (RRHH)';

function diasDesde(fecha: string) {
  return Math.round((new Date(`${HOY}T12:00:00`).getTime() - new Date(`${fecha}T12:00:00`).getTime()) / 86400000);
}

/**
 * Estado del prototipo de papeletas. Todo vive en memoria: los cambios
 * se pierden al recargar la página.
 */
export function usePapeletas() {
  const [papeletas, setPapeletas] = useState<Papeleta[]>(crearPapeletasPrueba);
  const [filtros, setFiltros] = useState<FiltrosPapeletas>(FILTROS_INICIALES);
  const [seleccion, setSeleccion] = useState<Papeleta[]>([]);

  const actualizarFiltros = useCallback((cambios: Partial<FiltrosPapeletas>) => {
    setFiltros((f) => ({ ...f, ...cambios }));
    setSeleccion([]);
  }, []);

  const limpiarFiltros = useCallback(() => setFiltros(FILTROS_INICIALES), []);

  /** Lista sin el filtro de estado: alimenta los contadores de las pestañas. */
  const sinFiltroEstado = useMemo(() => {
    const q = filtros.busqueda.trim().toLowerCase();
    return papeletas.filter((p) => {
      // "Ver anuladas" muestra solo las anuladas; apagado, solo las vigentes. Nunca se mezclan.
      if (filtros.verAnuladas !== (p.estado === 'anulada')) return false;
      if (filtros.area && p.trabajador.area !== filtros.area) return false;
      if (filtros.tipo && p.tipo !== filtros.tipo) return false;
      const dias = diasDesde(p.fecha);
      if (filtros.rango === 'hoy' && dias !== 0) return false;
      if (filtros.rango === 'semana' && dias > 6) return false;
      if (q) {
        const texto = `${p.numero} ${p.trabajador.nombre} ${p.trabajador.dni} ${p.trabajador.cargo} ${p.motivo}`.toLowerCase();
        if (!texto.includes(q)) return false;
      }
      return true;
    });
  }, [papeletas, filtros]);

  const visibles = useMemo(
    // Con "Ver anuladas" el filtro de estado no aplica: todas son anuladas.
    () =>
      filtros.estado === 'todas' || filtros.verAnuladas
        ? sinFiltroEstado
        : sinFiltroEstado.filter((p) => p.estado === filtros.estado),
    [sinFiltroEstado, filtros.estado, filtros.verAnuladas],
  );

  const conteoEstados = useMemo(() => {
    const c = { todas: sinFiltroEstado.length, pendiente: 0, aprobada: 0, rechazada: 0 };
    for (const p of sinFiltroEstado) if (p.estado !== 'anulada') c[p.estado]++;
    return c;
  }, [sinFiltroEstado]);

  const resumen: ResumenPapeletas = useMemo(() => {
    const deHoy = papeletas.filter((p) => p.fecha === HOY);
    return {
      pendientes: papeletas.filter((p) => p.estado === 'pendiente').length,
      aprobadas: deHoy.filter((p) => p.estado === 'aprobada').length,
      rechazadas: deHoy.filter((p) => p.estado === 'rechazada').length,
      fueraAhora: deHoy.filter((p) => p.estado === 'aprobada' && p.retorno === null).length,
    };
  }, [papeletas]);

  const registrar = (p: Papeleta, evento: Omit<EventoHistorial, 'usuario' | 'fecha'>, cambios: Partial<Papeleta>) => ({
    ...p,
    ...cambios,
    historial: [...p.historial, { ...evento, usuario: USUARIO_ACTUAL, fecha: new Date().toISOString() }],
  });

  const cambiarEstado = useCallback(
    (ids: string[], estado: Papeleta['estado'], accion: EventoHistorial['accion'], nota?: string) => {
      setPapeletas((lista) => lista.map((p) => (ids.includes(p.id) ? registrar(p, { accion, nota }, { estado }) : p)));
      setSeleccion([]);
    },
    [],
  );

  const aprobar = useCallback((ids: string[]) => cambiarEstado(ids, 'aprobada', 'aprobada'), [cambiarEstado]);
  const rechazar = useCallback(
    (ids: string[], motivo: string) => cambiarEstado(ids, 'rechazada', 'rechazada', motivo),
    [cambiarEstado],
  );
  const anular = useCallback((id: string) => cambiarEstado([id], 'anulada', 'anulada'), [cambiarEstado]);
  const restaurar = useCallback((id: string) => cambiarEstado([id], 'pendiente', 'restaurada'), [cambiarEstado]);

  /** Crea o edita. El número lo asigna "el servidor" (aquí: el siguiente libre). */
  const guardar = useCallback(
    (datos: DatosPapeleta, id?: string): number => {
      if (id) {
        setPapeletas((lista) => lista.map((p) => (p.id === id ? registrar(p, { accion: 'editada' }, datos) : p)));
        return papeletas.find((p) => p.id === id)?.numero ?? 0;
      }
      const numero = Math.max(0, ...papeletas.map((p) => p.numero)) + 1;
      const nueva: Papeleta = {
        ...datos,
        id: `pp-${numero}`,
        numero,
        estado: 'pendiente',
        historial: [{ accion: 'creada', usuario: USUARIO_ACTUAL, fecha: new Date().toISOString() }],
      };
      setPapeletas((lista) => [nueva, ...lista]);
      return numero;
    },
    [papeletas],
  );

  return {
    papeletas,
    visibles,
    filtros,
    conteoEstados,
    resumen,
    seleccion,
    setSeleccion,
    actualizarFiltros,
    limpiarFiltros,
    aprobar,
    rechazar,
    anular,
    restaurar,
    guardar,
  };
}
