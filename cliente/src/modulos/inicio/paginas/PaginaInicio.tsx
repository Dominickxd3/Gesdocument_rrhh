import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { esGestor, type UsuarioSesion } from '@/compartido/sesion/tipos';
import { useContador } from '@/compartido/navegacion/contadores';
import { aDiaLocal, diaLocalDe, hoyLocal } from '@/compartido/formato/fechas';
import {
  BarrasMeta,
  ColumnasMes,
  Pestanas,
  TarjetaGrafico,
  TarjetaPendiente,
  type FilaPorcentaje,
  type Mes,
} from '@/compartido/graficos/Graficos';
import { pendientesDe } from '@/aplicacion/pendientes';
import { useDocumentos } from '@/modulos/documentos/aplicacion/almacenDocumentos';
import { habilitadoParaTrabajador, ultimoEvento } from '@/modulos/documentos/dominio/documento';
import { useIncidencias } from '@/modulos/incidencias/aplicacion/almacenIncidencias';
import { useListaDescansos } from '@/modulos/descansos-medicos/aplicacion/almacenDescansos';
import type { Descanso } from '@/modulos/descansos-medicos/dominio/descanso';
import { usePapeletasCompartidas } from '@/modulos/papeletas-permiso/aplicacion/almacenPapeletas';
import { faltaFirmaColaborador } from '@/modulos/papeletas-permiso/dominio/papeleta';
import { repositorioBoletas } from '@/modulos/boletas-pago/aplicacion/repositorioBoletas';
import type { Boleta } from '@/modulos/boletas-pago/dominio/boleta';
import { CeldaPersona } from '@/compartido/componentes/TablaListado';
import { enlaceConFiltro } from '@/compartido/navegacion/filtroDeEnlace';
import { useTrabajadores } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import '@/compartido/estilos/listados';

/**
 * Inicio: tablero de lectura rápida.
 *  - Resumen: 6 indicadores con semáforo (contra meta o contra el mes anterior).
 *  - Gráficos: cada uno responde una pregunta (dona = partes de un total, barras = comparar, columnas = tendencia).
 */
export function PaginaInicio() {
  const usuario = useUsuarioActual();
  // Se vuelve a dibujar cuando cambian los datos de los módulos.
  useContador('/documentos', usuario);
  const gestor = esGestor(usuario);

  return (
    <div className="inicio">
      <header>
        <h1>Hola, {usuario.nombre.split(' ')[0]}</h1>
        <p className="inicio__saludo">{gestor ? 'Así está la gestión de RR. HH. hoy.' : 'Así están tus documentos, permisos y boletas.'}</p>
      </header>
      {gestor ? <TableroGestor /> : <TableroTrabajador usuario={usuario} />}
    </div>
  );
}

/* ---------- Utilidades ---------- */
const MS_DIA = 86400000;
const aFecha = (dia: string) => new Date(`${dia}T12:00:00`);
const diasDesde = (fecha: string) => Math.max(0, Math.round((aFecha(hoyLocal()).getTime() - aFecha(diaLocalDe(fecha)).getTime()) / MS_DIA));
const mayuscula = (t: string) => t.replace(/^\p{L}/u, (l) => l.toUpperCase());
const formatoMes = new Intl.DateTimeFormat('es-PE', { month: 'short' });
const formatoMesLargo = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' });
const sinArea = (area: string) => area.replace(/^(ADM|COM) /, '');

/** Los últimos 6 meses (el actual al final), con su clave AAAA-MM. */
function ultimosMeses(cantidad = 6, hasta = new Date()) {
  return Array.from({ length: cantidad }, (_, i) => {
    const d = new Date(hasta);
    d.setDate(1);
    d.setMonth(d.getMonth() - (cantidad - 1 - i));
    return { clave: aDiaLocal(d).slice(0, 7), etiqueta: formatoMes.format(d).replace('.', ''), nombre: mayuscula(formatoMesLargo.format(d)) };
  });
}

/** Días de descanso reconocidos que caen dentro de un mes (AAAA-MM). */
function diasEnMes(d: Descanso, mes: string) {
  if (!d.reconocido) return 0;
  let dias = 0;
  for (let t = aFecha(d.reconocido.inicio).getTime(); t <= aFecha(d.reconocido.fin).getTime(); t += MS_DIA) {
    if (aDiaLocal(new Date(t)).startsWith(mes)) dias += 1;
  }
  return dias;
}

/** Plazo de atención de cada pendiente, en días. */
const PLAZOS = { papeletas: 1, descansos: 3, documentos: 3, incidencias: 7 };

/** Metas de cumplimiento (porcentaje). Se ajustan aquí. */
const METAS = { boletas: 95 };

/* ---------- RR. HH. y Administrador ---------- */
type Top = 'firmas' | 'papeletas' | 'descansos';

interface FilaTop {
  dni: string;
  nombre: string;
  area: string;
  valor: number;
}

/** Suma por trabajador y devuelve los 5 con más (en empate, por nombre). */
function top5(filas: { dni: string; nombre: string; area: string; valor: number }[]): FilaTop[] {
  const mapa = new Map<string, FilaTop>();
  filas.forEach((f) => {
    const fila = mapa.get(f.dni) ?? { ...f, valor: 0 };
    fila.valor += f.valor;
    mapa.set(f.dni, fila);
  });
  return [...mapa.values()]
    .filter((f) => f.valor > 0)
    .sort((a, b) => b.valor - a.valor || a.nombre.localeCompare(b.nombre, 'es'))
    .slice(0, 5)
    .map((f) => ({ ...f, area: sinArea(f.area) }));
}

/**
 * Boletas por periodo, guardadas en memoria: al volver a Inicio los indicadores
 * aparecen al instante con el mismo valor, sin recargar ni parpadear.
 */
const cacheBoletas = new Map<string, Boleta[]>();
function useBoletasDelMes(anio: number, mes: number) {
  const clave = `${anio}-${mes}`;
  const [, setVersion] = useState(0);
  useEffect(() => {
    if (cacheBoletas.has(clave)) return;
    let vigente = true;
    void (async () => {
      const periodo = (await repositorioBoletas.listarPeriodos()).find((p) => p.anio === anio && p.mes === mes);
      cacheBoletas.set(clave, periodo ? await repositorioBoletas.listarBoletas(periodo) : []);
      if (vigente) setVersion((v) => v + 1);
    })();
    return () => {
      vigente = false;
    };
  }, [clave, anio, mes]);
  return cacheBoletas.get(clave) ?? null;
}

/** Periodo elegido: se conserva al ir a otra pantalla y volver a Inicio. */
const periodoElegido = { anio: new Date().getFullYear(), mes: new Date().getMonth() + 1 };

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

/** Periodo (mes y año) del Inicio, compartido por todos los roles. */
function usePeriodo() {
  const hoy = new Date();
  const [anio, setAnio] = useState(periodoElegido.anio);
  const [mes, setMes] = useState(periodoElegido.mes);
  periodoElegido.anio = anio;
  periodoElegido.mes = mes;
  const clave = `${anio}-${String(mes).padStart(2, '0')}`;
  // No se puede elegir un mes que aún no llega.
  const mesesDisponibles = MESES.map((m, i) => ({ label: mayuscula(m), value: i + 1 })).filter((m) => anio < hoy.getFullYear() || m.value <= hoy.getMonth() + 1);
  const anios = [hoy.getFullYear() - 1, hoy.getFullYear()].map((a) => ({ label: String(a), value: a }));
  const filtro = (
    <div className="inicio__filtro">
      <span>Periodo</span>
      <Dropdown value={mes} options={mesesDisponibles} onChange={(e) => setMes(e.value)} aria-label="Mes" className="inicio__mes" />
      <Dropdown
        value={anio}
        options={anios}
        onChange={(e) => {
          setAnio(e.value);
          if (e.value === hoy.getFullYear() && mes > hoy.getMonth() + 1) setMes(hoy.getMonth() + 1);
        }}
        aria-label="Año"
        className="inicio__anio"
      />
    </div>
  );
  return { anio, mes, clave, nombreMes: MESES[mes - 1], esMesActual: anio === hoy.getFullYear() && mes === hoy.getMonth() + 1, filtro };
}

/** Semáforo de los meses: el menor en rojo, el mayor en verde y los del medio en amarillo. */
function conSemaforo(lista: Mes[]): Mes[] {
  const valores = lista.map((m) => m.valor);
  const menor = Math.min(...valores);
  const mayor = Math.max(...valores);
  return lista.map((m) => ({
    ...m,
    color: menor === mayor ? 'var(--sem-atencion-relleno)' : m.valor === menor ? 'var(--sem-critico-relleno)' : m.valor === mayor ? 'var(--sem-bien-relleno)' : 'var(--sem-atencion-relleno)',
  }));
}

function TableroGestor() {
  const navegar = useNavigate();
  const papeletas = usePapeletasCompartidas();
  const documentos = useDocumentos();
  const incidencias = useIncidencias();
  const descansos = useListaDescansos();
  const trabajadores = useTrabajadores();
  const { anio, mes, clave, nombreMes, filtro } = usePeriodo();
  const [tendencia, setTendencia] = useState<'papeletas' | 'descansos'>('papeletas');
  const [top, setTop] = useState<Top>('firmas');
  const boletas = useBoletasDelMes(anio, mes);
  const delMes = (fecha: string) => diaLocalDe(fecha).startsWith(clave);

  /* --- KPI 1: pendientes del mes que ya pasaron su plazo --- */
  const vencidos = [
    papeletas.filter((p) => p.estado === 'pendiente' && delMes(p.fecha) && diasDesde(p.historial[0]?.fecha ?? p.fecha) > PLAZOS.papeletas).length,
    descansos.filter((d) => d.estado === 'pendiente_revision' && delMes(d.inicio) && diasDesde(d.historial[d.historial.length - 1].fecha) > PLAZOS.descansos).length,
    documentos.filter((d) => d.estado === 'observado' && delMes(d.historial[0].fecha) && diasDesde(d.historial[d.historial.length - 1].fecha) > PLAZOS.documentos).length,
    incidencias.filter((i) => (i.estado === 'registrada' || i.estado === 'en_investigacion') && delMes(i.fecha) && diasDesde(i.fecha) > PLAZOS.incidencias).length,
  ];
  const totalVencidos = vencidos.reduce((s, n) => s + n, 0);
  const cuenta = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
  const desgloseVencidos = [
    vencidos[0] && cuenta(vencidos[0], 'papeleta', 'papeletas'),
    vencidos[1] && cuenta(vencidos[1], 'descanso', 'descansos'),
    vencidos[2] && cuenta(vencidos[2], 'documento', 'documentos'),
    vencidos[3] && cuenta(vencidos[3], 'incidencia', 'incidencias'),
  ]
    .filter(Boolean)
    .join(' · ');
  const rutas = ['/papeletas-permiso', '/descansos-medicos', '/documentos', '/incidencias'];
  const rutaVencidos = rutas[vencidos.indexOf(Math.max(...vencidos))];

  /* --- KPI 2 y gráfico 1: firma de boletas del mes --- */
  const enviadas = boletas?.filter((b) => b.estadoEnvio === 'enviado') ?? [];
  const firmadas = enviadas.filter((b) => b.firma === 'firmada').length;
  const porArea = new Map<string, FilaPorcentaje>();
  enviadas.forEach((b) => {
    const area = sinArea(b.area);
    const fila = porArea.get(area) ?? { etiqueta: area, valor: 0, total: 0 };
    fila.total += 1;
    if (b.firma === 'firmada') fila.valor += 1;
    porArea.set(area, fila);
  });
  // Solo las 5 áreas que más atención necesitan.
  const areasCriticas = [...porArea.values()].sort((a, b) => a.valor / a.total - b.valor / b.total || a.etiqueta.localeCompare(b.etiqueta, 'es')).slice(0, 5);

  /* --- KPI 3 y gráfico 2: tendencia de los 6 meses que terminan en el mes elegido --- */
  const meses = ultimosMeses(3, new Date(anio, mes - 1, 1));
  // Cada mes del año tiene su color.
  const papeletasMes: Mes[] = meses.map((m) => ({ etiqueta: m.etiqueta, nombre: m.nombre, valor: papeletas.filter((p) => p.estado !== 'anulada' && p.fecha.startsWith(m.clave)).length }));
  const descansoMes: Mes[] = meses.map((m) => ({ etiqueta: m.etiqueta, nombre: m.nombre, valor: descansos.reduce((s, d) => s + diasEnMes(d, m.clave), 0) }));
  const diasActual = descansoMes[descansoMes.length - 1].valor;
  const diasAnterior = descansoMes[descansoMes.length - 2].valor;
  const descansosDelMes = descansos.filter((d) => diasEnMes(d, clave) > 0).length;

  /* --- Top 5 de trabajadores del mes --- */
  const datosDe = (dni: string, nombre: string, area = '') => {
    const t = trabajadores.find((x) => x.dni === dni);
    return { dni, nombre: t?.nombre ?? nombre, area: t?.area ?? area };
  };
  const tops: Record<Top, { titulo: string; columna: string; filas: FilaTop[]; vacio: string }> = {
    firmas: {
      titulo: 'Más boletas por firmar',
      columna: 'Por firmar',
      vacio: `Nadie tiene boletas por firmar de ${nombreMes}.`,
      filas: top5(enviadas.filter((b) => b.firma === 'pendiente').map((b) => ({ ...datosDe(b.dni, b.trabajador, b.area), valor: 1 }))),
    },
    papeletas: {
      titulo: 'Más papeletas',
      columna: 'Papeletas',
      vacio: `No hay papeletas en ${nombreMes}.`,
      filas: top5(papeletas.filter((p) => p.estado !== 'anulada' && p.fecha.startsWith(clave)).map((p) => ({ ...datosDe(p.trabajador.dni, p.trabajador.nombre, p.trabajador.area), valor: 1 }))),
    },
    descansos: {
      titulo: 'Más días de descanso médico',
      columna: 'Días',
      vacio: `No hay descansos reconocidos en ${nombreMes}.`,
      filas: top5(descansos.map((d) => ({ ...datosDe(d.trabajador.dni, d.trabajador.nombre, d.trabajador.area), valor: diasEnMes(d, clave) }))),
    },
  };
  const tablaTop = tops[top];
  // Cada fila abre su módulo, filtrado por ese trabajador y el periodo elegido.
  const primerDia = `${clave}-01`;
  const ultimoDiaMes = `${clave}-${String(new Date(anio, mes, 0).getDate()).padStart(2, '0')}`;
  const abrirFila = (dni: string) =>
    navegar(
      top === 'firmas'
        ? enlaceConFiltro('/boletas-pago', { dni, anio, mes })
        : enlaceConFiltro(top === 'papeletas' ? '/papeletas-permiso' : '/descansos-medicos', { dni, desde: primerDia, hasta: ultimoDiaMes }),
      { state: { volverA: 'Inicio' } },
    );

  return (
    <>
      {filtro}

      {/* Indicadores fijos: solo el número, sin etiquetas ni colores que cambien con el periodo. */}
      <div className="gr-fila es-3 es-fija">
        <TarjetaPendiente
          titulo="Trámites atrasados"
          icono="pi pi-stopwatch"
          cantidad={<>{totalVencidos} <span className="gr-unidad">{totalVencidos === 1 ? 'trámite' : 'trámites'}</span></>}
          estado={totalVencidos === 0 ? 'bien' : totalVencidos <= 5 ? 'atencion' : 'critico'}
          etiqueta={totalVencidos === 0 ? 'Bueno' : totalVencidos <= 5 ? 'Intermedio' : 'En riesgo'}
          detalle={totalVencidos ? desgloseVencidos : `Nada vencido de ${nombreMes}`}
          alAbrir={() => navegar(rutaVencidos)}
        />
        {boletas ? (
          <TarjetaPendiente titulo="Boletas firmadas" icono="pi pi-wallet" cantidad={<>{firmadas} <span className="gr-unidad">de {enviadas.length} enviadas</span></>} estado="bien" detalle="" alAbrir={() => navegar('/boletas-pago')} />
        ) : (
          <TarjetaPendiente titulo="Boletas firmadas" icono="pi pi-wallet" cantidad="—" estado="bien" etiqueta="Cargando" detalle="Leyendo las boletas del mes" alAbrir={() => navegar('/boletas-pago')} />
        )}
        <TarjetaPendiente
          titulo="Días de descanso médico"
          icono="pi pi-heart"
          cantidad={<>{diasActual} <span className="gr-unidad">{diasActual === 1 ? 'día' : 'días'}</span></>}
          estado={diasActual <= diasAnterior ? 'bien' : diasActual <= diasAnterior * 1.2 ? 'atencion' : 'critico'}
          etiqueta={diasActual <= diasAnterior ? 'Bajó o igual' : diasActual <= diasAnterior * 1.2 ? 'Subió un poco' : 'Subió mucho'}
          detalle={`${cuenta(descansosDelMes, "descanso médico", "descansos médicos")} · ${MESES[(mes + 10) % 12]}: ${cuenta(diasAnterior, "día", "días")}`}
          alAbrir={() => navegar('/descansos-medicos')}
        />
      </div>

      <div className="gr-graficos">
        <TarjetaGrafico titulo="Áreas con menos boletas firmadas" pregunta={`${mayuscula(nombreMes)} · la línea marca la meta (${METAS.boletas} %)`} accion={{ etiqueta: 'Ver', alPresionar: () => navegar('/boletas-pago') }}>
          {areasCriticas.length ? <BarrasMeta filas={areasCriticas} meta={METAS.boletas} unidad="boletas" ordenado estadoDe={(pct) => (pct > 50 ? 'bien' : pct === 50 ? 'atencion' : 'critico')} /> : <p className="gr-vacio">{boletas ? `Aún no se envían boletas de ${nombreMes}.` : 'Cargando…'}</p>}
        </TarjetaGrafico>

        <TarjetaGrafico
          titulo={tendencia === 'papeletas' ? 'Papeletas por mes' : 'Descansos médicos por mes'}
          extra={
            <Pestanas
              valor={tendencia}
              alCambiar={setTendencia}
              opciones={[
                { valor: 'papeletas', etiqueta: 'Papeletas' },
                { valor: 'descansos', etiqueta: 'Descansos' },
              ]}
            />
          }
        >
          <ColumnasMes resumen={false} conUnidad={tendencia === 'descansos'} meses={conSemaforo(tendencia === 'papeletas' ? papeletasMes : descansoMes)} unidad={tendencia === 'papeletas' ? ['papeleta', 'papeletas'] : ['día', 'días']} />
        </TarjetaGrafico>
      </div>

      <TarjetaGrafico
        titulo={`Top ${Math.max(1, tablaTop.filas.length)} · ${tablaTop.titulo}`}
        pregunta={`${mayuscula(nombreMes)} ${anio}`}
        extra={
          <Pestanas
            valor={top}
            alCambiar={setTop}
            opciones={[
              { valor: 'firmas', etiqueta: 'Boletas por firmar' },
              { valor: 'papeletas', etiqueta: 'Papeletas' },
              { valor: 'descansos', etiqueta: 'Descansos' },
            ]}
          />
        }
      >
        {tablaTop.filas.length ? (
          <table className="gr-top">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Trabajador</th>
                <th scope="col" className="gr-top__area">Área</th>
                <th scope="col" className="gr-top__num">{tablaTop.columna}</th>
              </tr>
            </thead>
            <tbody>
              {tablaTop.filas.map((f, i) => (
                <tr key={f.dni} onClick={() => abrirFila(f.dni)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && abrirFila(f.dni)}>
                  <td className="gr-top__puesto">{i + 1}</td>
                  <td>
                    <CeldaPersona nombre={f.nombre} detalle={f.area} />
                  </td>
                  <td className="gr-top__area">{f.area}</td>
                  <td className="gr-top__num">
                    <strong>{f.valor}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="gr-vacio">{tablaTop.vacio}</p>
        )}
      </TarjetaGrafico>
    </>
  );
}

/* ---------- Trabajador y Seguridad ---------- */
/**
 * Mismo estilo que el Inicio de RR. HH.: filtro de periodo, indicadores fijos (solo número y unidad),
 * dos gráficos de barras y una tabla con lo que tiene por atender. Solo sus propios datos.
 */
function TableroTrabajador({ usuario }: { usuario: UsuarioSesion }) {
  const navegar = useNavigate();
  const papeletas = usePapeletasCompartidas();
  const documentos = useDocumentos();
  const descansos = useListaDescansos();
  const incidencias = useIncidencias();
  const { anio, mes, clave, nombreMes, esMesActual, filtro } = usePeriodo();
  const [misBoletas, setMisBoletas] = useState<{ anio: number; mes: number; firmada: boolean }[] | null>(null);
  const dni = usuario.dni;
  const esSeguridad = usuario.rol === 'seguridad';

  useEffect(() => {
    if (!dni) return;
    let vigente = true;
    void repositorioBoletas.listarBoletasDe(dni).then((lista) => {
      if (vigente) setMisBoletas(lista.map((b) => ({ anio: b.periodo.anio, mes: b.periodo.mes, firmada: b.boleta.firma === 'firmada' })));
    });
    return () => {
      vigente = false;
    };
  }, [dni]);

  const delMes = (fecha: string) => diaLocalDe(fecha).startsWith(clave);
  const finDelMes = `${clave}-${String(new Date(anio, mes, 0).getDate()).padStart(2, '0')}`;
  const hastaElMes = (fecha: string) => diaLocalDe(fecha) <= finDelMes;

  /* --- Lo que tiene por atender del periodo (lo registrado ese mes que sigue pendiente) --- */
  const misDocumentos = documentos.filter((d) => d.dni === dni && habilitadoParaTrabajador(d));
  const enviadoEl = (d: (typeof misDocumentos)[number]) => ultimoEvento(d, 'enviado')?.fecha ?? d.historial[0].fecha;
  const cantidades: Record<string, number> = {
    '/mi-expediente/documentos': misDocumentos.filter((d) => d.estado === 'pendiente_firma' && delMes(enviadoEl(d))).length,
    '/papeletas-permiso': papeletas.filter((p) => p.trabajador.dni === dni && faltaFirmaColaborador(p) && delMes(p.fecha)).length,
    '/mi-expediente/descansos-medicos': descansos.filter((d) => d.trabajador.dni === dni && (d.estado === 'aviso' || d.estado === 'observado') && delMes(d.inicio)).length,
    '/mi-expediente/memorandums': incidencias.filter((i) => i.dni === dni && i.estado === 'memo_emitido' && delMes(i.memorandum?.emitido ?? i.fecha)).length,
  };
  // Seguridad: hoy, las salidas por controlar; en meses anteriores, las salidas que controló.
  const salidas = esSeguridad
    ? esMesActual
      ? papeletas.filter((p) => p.estado === 'aprobada' && p.fecha === hoyLocal() && !p.controlSalida).length
      : papeletas.filter((p) => p.controlSalida && delMes(p.fecha)).length
    : 0;
  const pendientes = [
    ...(esSeguridad && esMesActual ? [{ ruta: '/control-salidas', icono: 'pi pi-shield', titulo: 'Salidas por controlar hoy', detalle: 'Papeletas autorizadas para hoy', cantidad: salidas }] : []),
    ...pendientesDe(usuario).map((p) => ({ ...p, cantidad: cantidades[p.ruta] ?? 0 })),
  ];
  const porAtender = pendientes.filter((p) => p.cantidad > 0);
  const totalPendientes = porAtender.reduce((s, p) => s + p.cantidad, 0);

  /* --- Firmas acumuladas del año hasta el mes elegido --- */
  const boletasAnio = (misBoletas ?? []).filter((b) => b.anio === anio && b.mes <= mes);
  const boletasFirmadas = boletasAnio.filter((b) => b.firmada).length;
  const documentosHasta = misDocumentos.filter((d) => hastaElMes(enviadoEl(d)));
  const firmas: FilaPorcentaje[] = [
    { etiqueta: 'Boletas de pago', valor: boletasFirmadas, total: boletasAnio.length },
    { etiqueta: 'Documentos', valor: documentosHasta.filter((d) => d.estado === 'firmado').length, total: documentosHasta.length },
  ].filter((f) => f.total > 0);

  /* --- Días de descanso del mes y papeletas de los 3 meses hasta el elegido --- */
  const diasDescanso = descansos.filter((d) => d.trabajador.dni === dni).reduce((s, d) => s + diasEnMes(d, clave), 0);
  const papeletasMes: Mes[] = conSemaforo(
    ultimosMeses(3, new Date(anio, mes - 1, 1)).map((m) => ({
      etiqueta: m.etiqueta,
      nombre: m.nombre,
      valor: papeletas.filter((p) => p.trabajador.dni === dni && p.estado !== 'anulada' && p.fecha.startsWith(m.clave)).length,
    })),
  );

  const unidad = (n: number, uno: string, varios: string) => <span className="gr-unidad">{n === 1 ? uno : varios}</span>;

  return (
    <>
      {filtro}

      {/* Indicadores fijos: solo el número, sin etiquetas ni colores que cambien. */}
      <div className={`gr-fila es-fija${esSeguridad ? '' : ' es-3'}`}>
        {esSeguridad && (
          <TarjetaPendiente
            titulo={esMesActual ? 'Salidas por controlar' : 'Salidas controladas'}
            icono="pi pi-shield"
            cantidad={<>{salidas} {esMesActual ? unidad(salidas, 'hoy', 'hoy') : unidad(salidas, 'salida', 'salidas')}</>}
            estado="bien"
            detalle=""
            alAbrir={() => navegar('/control-salidas')}
          />
        )}
        <TarjetaPendiente titulo="Por atender" icono="pi pi-inbox" cantidad={<>{totalPendientes} {unidad(totalPendientes, 'pendiente', 'pendientes')}</>} estado="bien" detalle="" alAbrir={() => navegar(porAtender[0]?.ruta ?? '/mi-expediente')} />
        <TarjetaPendiente
          titulo="Boletas firmadas"
          icono="pi pi-wallet"
          cantidad={misBoletas ? <>{boletasFirmadas} <span className="gr-unidad">de {boletasAnio.length}</span></> : '—'}
          estado="bien"
          detalle=""
          alAbrir={() => navegar('/mi-expediente/boletas')}
        />
        <TarjetaPendiente titulo="Días de descanso médico" icono="pi pi-heart" cantidad={<>{diasDescanso} {unidad(diasDescanso, 'día', 'días')}</>} estado="bien" detalle="" alAbrir={() => navegar('/mi-expediente/descansos-medicos')} />
      </div>

      <div className="gr-graficos">
        <TarjetaGrafico titulo="Mis firmas" pregunta={`De enero a ${nombreMes} de ${anio}`} accion={{ etiqueta: 'Ver', alPresionar: () => navegar('/mi-expediente') }}>
          {firmas.length ? (
            <BarrasMeta filas={firmas} meta={100} unidad="firmados" ordenado estadoDe={(pct) => (pct > 50 ? 'bien' : pct === 50 ? 'atencion' : 'critico')} />
          ) : (
            <p className="gr-vacio">{misBoletas ? 'Aún no tienes boletas ni documentos para firmar.' : 'Cargando…'}</p>
          )}
        </TarjetaGrafico>

        <TarjetaGrafico titulo="Mis papeletas por mes" accion={{ etiqueta: 'Ver', alPresionar: () => navegar('/papeletas-permiso') }}>
          <ColumnasMes resumen={false} meses={papeletasMes} unidad={['papeleta', 'papeletas']} />
        </TarjetaGrafico>
      </div>

      <TarjetaGrafico titulo="Por atender" pregunta={porAtender.length ? 'Toca una fila para resolverlo.' : undefined}>
        {porAtender.length ? (
          <table className="gr-top es-tramites">
            <thead>
              <tr>
                <th scope="col">Trámite</th>
                <th scope="col" className="gr-top__area">Qué hacer</th>
                <th scope="col" className="gr-top__num">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {porAtender.map((p) => (
                <tr key={p.ruta} onClick={() => navegar(p.ruta)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navegar(p.ruta)}>
                  <td>
                    <span className="inicio__tramite">
                      <i className={p.icono} aria-hidden="true" />
                      <strong>{p.titulo}</strong>
                    </span>
                  </td>
                  <td className="gr-top__area">{p.detalle}</td>
                  <td className="gr-top__num">
                    <strong>{p.cantidad}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="gr-vacio">Estás al día: no tienes nada pendiente de {nombreMes}.</p>
        )}
      </TarjetaGrafico>
    </>
  );
}
