import { useCallback, useEffect, useMemo, useState } from 'react';
import { leerFiltroDeEnlace } from '@/compartido/navegacion/filtroDeEnlace';
import {
  calcularResumen,
  clavePeriodo,
  cumpleBusqueda,
  cumpleFiltroEstado,
  type Boleta,
  type ConfiguracionBoletas,
  type FiltroEstado,
  type Periodo,
  type RepositorioBoletas,
} from '../dominio/boleta';

export interface FiltrosBoletas {
  busqueda: string;
  area: string | null;
  estado: FiltroEstado;
}

const FILTROS_INICIALES: FiltrosBoletas = { busqueda: '', area: null, estado: 'todas' };

/** Estado y casos de uso de la pantalla de boletas (servicio de aplicación del cliente). */
export function useBoletas(repositorio: RepositorioBoletas) {
  const [configuracion, setConfiguracion] = useState<ConfiguracionBoletas | null>(null);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodo, setPeriodo] = useState<Periodo | null>(null);
  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [cargando, setCargando] = useState(true);
  // Si se llega desde el Inicio, ya viene filtrado por trabajador y periodo.
  const [enlace] = useState(leerFiltroDeEnlace);
  const [filtros, setFiltros] = useState<FiltrosBoletas>(() => ({ ...FILTROS_INICIALES, busqueda: enlace.dni ?? '' }));
  const [seleccion, setSeleccion] = useState<Boleta[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    void repositorio.obtenerConfiguracion().then(setConfiguracion);
    void repositorio.listarPeriodos().then((lista) => {
      setPeriodos(lista);
      const delEnlace = lista.find((p) => p.anio === enlace.anio && p.mes === enlace.mes);
      setPeriodo(delEnlace ?? lista.find((p) => p.estado === 'cerrado') ?? lista[0] ?? null);
    });
  }, [repositorio, enlace]);

  const cargar = useCallback(async () => {
    if (!periodo) return;
    setCargando(true);
    setBoletas(await repositorio.listarBoletas(periodo));
    setSeleccion([]);
    setCargando(false);
  }, [periodo, repositorio]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const cambiarPeriodo = useCallback(
    (clave: string) => {
      const encontrado = periodos.find((p) => clavePeriodo(p) === clave);
      if (encontrado) setPeriodo(encontrado);
    },
    [periodos],
  );

  /** Boletas que cumplen búsqueda y área; base para los contadores del filtro de estado. */
  const boletasBase = useMemo(
    () =>
      boletas.filter(
        (b) => cumpleBusqueda(b, filtros.busqueda) && (!filtros.area || b.area === filtros.area),
      ),
    [boletas, filtros.busqueda, filtros.area],
  );

  const boletasVisibles = useMemo(
    () => boletasBase.filter((b) => cumpleFiltroEstado(b, filtros.estado)),
    [boletasBase, filtros.estado],
  );

  const resumenPeriodo = useMemo(() => calcularResumen(boletas), [boletas]);
  const resumenFiltrado = useMemo(() => calcularResumen(boletasBase), [boletasBase]);

  const actualizarFiltros = useCallback((cambios: Partial<FiltrosBoletas>) => {
    setFiltros((actuales) => ({ ...actuales, ...cambios }));
    setSeleccion([]);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIALES);
    setSeleccion([]);
  }, []);

  /** Publica las boletas en la cuenta de cada colaborador; devuelve cuántas se enviaron. */
  const enviar = useCallback(
    async (lista: Boleta[]) => {
      if (!periodo || lista.length === 0) return 0;
      setEnviando(true);
      try {
        const ids = lista.map((b) => b.id);
        const fecha = await repositorio.enviar(periodo, ids);
        const enviados = new Set(ids);
        setBoletas((actuales) =>
          actuales.map((b) => (enviados.has(b.id) ? { ...b, estadoEnvio: 'enviado', fechaEnvio: fecha } : b)),
        );
        setSeleccion([]);
        return ids.length;
      } finally {
        setEnviando(false);
      }
    },
    [periodo, repositorio],
  );

  const revertirFirma = useCallback(
    async (boleta: Boleta) => {
      if (!periodo) return;
      await repositorio.revertirFirma(periodo, boleta.id);
      setBoletas((actuales) =>
        actuales.map((b) => (b.id === boleta.id ? { ...b, firma: 'pendiente', fechaFirma: null } : b)),
      );
    },
    [periodo, repositorio],
  );

  return {
    configuracion,
    periodos,
    periodo,
    cambiarPeriodo,
    cargando,
    recargar: cargar,
    todas: boletas,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    boletasVisibles,
    resumenPeriodo,
    resumenFiltrado,
    seleccion,
    setSeleccion,
    enviando,
    enviar,
    revertirFirma,
  };
}
