import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { esGestor, type UsuarioSesion } from '@/compartido/sesion/tipos';
import { useContador } from '@/compartido/navegacion/contadores';
import { aDiaLocal, diaLocalDe, hoyLocal } from '@/compartido/formato/fechas';
import {
  BarrasMeta,
  COLOR,
  ColumnasMes,
  Dona,
  Pestanas,
  Ranking,
  Seccion,
  TarjetaGrafico,
  TarjetaMeta,
  TarjetaPendiente,
  type FilaPorcentaje,
  type Mes,
  type Semaforo,
} from '@/compartido/graficos/Graficos';
import { pendientesDe } from '@/aplicacion/pendientes';
import { useDocumentos } from '@/modulos/documentos/aplicacion/almacenDocumentos';
import { habilitadoParaTrabajador } from '@/modulos/documentos/dominio/documento';
import { useIncidencias } from '@/modulos/incidencias/aplicacion/almacenIncidencias';
import { useListaDescansos } from '@/modulos/descansos-medicos/aplicacion/almacenDescansos';
import type { Descanso } from '@/modulos/descansos-medicos/dominio/descanso';
import { usePapeletasCompartidas } from '@/modulos/papeletas-permiso/aplicacion/almacenPapeletas';
import { repositorioBoletas } from '@/modulos/boletas-pago/aplicacion/repositorioBoletas';
import type { Boleta } from '@/modulos/boletas-pago/dominio/boleta';
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
const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
const mayuscula = (t: string) => t.replace(/^\p{L}/u, (l) => l.toUpperCase());
const formatoMes = new Intl.DateTimeFormat('es-PE', { month: 'short' });
const formatoMesLargo = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' });
const sinArea = (area: string) => area.replace(/^(ADM|COM) /, '');

/** Los últimos 6 meses (el actual al final), con su clave AAAA-MM. */
function ultimosMeses(cantidad = 6) {
  return Array.from({ length: cantidad }, (_, i) => {
    const d = new Date();
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
const METAS = { boletas: 95, documentos: 90, papeletasMismoDia: 90 };

/* ---------- RR. HH. y Administrador ---------- */
function TableroGestor() {
  const navegar = useNavigate();
  const papeletas = usePapeletasCompartidas();
  const documentos = useDocumentos();
  const incidencias = useIncidencias();
  const descansos = useListaDescansos();
  const [boletas, setBoletas] = useState<{ lista: Boleta[]; mes: string } | null>(null);
  const [motivos, setMotivos] = useState<'papeletas' | 'incidencias'>('papeletas');

  // Boletas del último mes cerrado.
  useEffect(() => {
    let vigente = true;
    void (async () => {
      const periodo = (await repositorioBoletas.listarPeriodos()).find((p) => p.estado === 'cerrado');
      if (!periodo) return;
      const lista = await repositorioBoletas.listarBoletas(periodo);
      const mes = new Intl.DateTimeFormat('es-PE', { month: 'long' }).format(new Date(periodo.anio, periodo.mes - 1, 1));
      if (vigente) setBoletas({ lista, mes });
    })();
    return () => {
      vigente = false;
    };
  }, []);

  /* --- Pendientes fuera de plazo --- */
  const fuera = (fechas: string[], plazo: number) => fechas.filter((f) => diasDesde(f) > plazo).length;
  const fueraDePlazo = {
    papeletas: fuera(papeletas.filter((p) => p.estado === 'pendiente').map((p) => p.historial[0]?.fecha ?? p.fecha), PLAZOS.papeletas),
    descansos: fuera(descansos.filter((d) => d.estado === 'pendiente_revision').map((d) => d.historial[d.historial.length - 1].fecha), PLAZOS.descansos),
    documentos: fuera(documentos.filter((d) => d.estado === 'observado').map((d) => d.historial[d.historial.length - 1].fecha), PLAZOS.documentos),
    incidencias: fuera(incidencias.filter((i) => i.estado === 'registrada' || i.estado === 'en_investigacion').map((i) => i.fecha), PLAZOS.incidencias),
  };
  const totalFuera = fueraDePlazo.papeletas + fueraDePlazo.descansos + fueraDePlazo.documentos + fueraDePlazo.incidencias;
  const desgloseFuera = [
    fueraDePlazo.papeletas && plural(fueraDePlazo.papeletas, 'papeleta', 'papeletas'),
    fueraDePlazo.descansos && plural(fueraDePlazo.descansos, 'descanso', 'descansos'),
    fueraDePlazo.documentos && plural(fueraDePlazo.documentos, 'documento', 'documentos'),
    fueraDePlazo.incidencias && plural(fueraDePlazo.incidencias, 'incidencia', 'incidencias'),
  ]
    .filter(Boolean)
    .join(' · ');
  // Lleva al módulo con más pendientes vencidos.
  const rutaFuera = (
    [
      ['/papeletas-permiso', fueraDePlazo.papeletas],
      ['/descansos-medicos', fueraDePlazo.descansos],
      ['/documentos', fueraDePlazo.documentos],
      ['/incidencias', fueraDePlazo.incidencias],
    ] as const
  ).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  /* --- Boletas --- */
  const enviadas = boletas?.lista.filter((b) => b.estadoEnvio === 'enviado') ?? [];
  const firmadas = enviadas.filter((b) => b.firma === 'firmada').length;
  const sinEnviar = (boletas?.lista.length ?? 0) - enviadas.length;
  const porArea = new Map<string, FilaPorcentaje>();
  enviadas.forEach((b) => {
    const area = sinArea(b.area);
    const fila = porArea.get(area) ?? { etiqueta: area, valor: 0, total: 0 };
    fila.total += 1;
    if (b.firma === 'firmada') fila.valor += 1;
    porArea.set(area, fila);
  });

  /* --- Documentos y papeletas --- */
  const docsEnviados = documentos.filter((d) => d.estado !== 'preparacion');
  const papeletas30 = papeletas.filter((p) => p.estado !== 'anulada' && diasDesde(p.fecha) < 30 && diasDesde(p.fecha) > 0);
  const mismoDia = papeletas30.filter((p) => {
    const resuelta = p.historial.find((h) => h.accion === 'aprobada' || h.accion === 'rechazada');
    return resuelta && diaLocalDe(resuelta.fecha) === diaLocalDe(p.historial[0].fecha);
  }).length;

  /* --- Tendencias por mes --- */
  const meses = ultimosMeses();
  const papeletasMes: Mes[] = meses.map((m) => {
    const del = papeletas.filter((p) => p.estado !== 'anulada' && p.fecha.startsWith(m.clave));
    return { etiqueta: m.etiqueta, nombre: m.nombre, valor: del.length, detalle: `${plural(del.filter((p) => p.estado === 'aprobada').length, 'aprobada', 'aprobadas')}, ${plural(del.filter((p) => p.estado === 'rechazada').length, 'rechazada', 'rechazadas')}` };
  });
  const descansoMes: Mes[] = meses.map((m) => {
    const del = descansos.filter((d) => diasEnMes(d, m.clave) > 0);
    return { etiqueta: m.etiqueta, nombre: m.nombre, valor: del.reduce((s, d) => s + diasEnMes(d, m.clave), 0), detalle: plural(del.length, 'descanso médico', 'descansos médicos') };
  });
  const diasActual = descansoMes[descansoMes.length - 1].valor;
  const diasAnterior = descansoMes[descansoMes.length - 2].valor;

  /* --- Incidencias --- */
  const abiertas = incidencias.filter((i) => i.estado === 'registrada' || i.estado === 'en_investigacion').length;
  const incidenciasMes = incidencias.filter((i) => i.fecha.startsWith(meses[meses.length - 1].clave)).length;

  /* --- Motivos --- */
  const contar = (textos: string[]) => {
    const mapa = new Map<string, number>();
    textos.forEach((t) => mapa.set(t, (mapa.get(t) ?? 0) + 1));
    return [...mapa.entries()]
      .map(([etiqueta, valor]) => ({ etiqueta, valor }))
      .sort((a, b) => b.valor - a.valor || a.etiqueta.localeCompare(b.etiqueta, 'es'))
      .slice(0, 5);
  };
  const motivosPapeletas = contar(papeletas.filter((p) => p.estado !== 'anulada' && diasDesde(p.fecha) < 90).map((p) => p.motivo));
  const motivosIncidencias = contar(incidencias.map((i) => i.asunto));

  const estadoDescanso: Semaforo = diasActual > diasAnterior * 1.2 ? 'critico' : diasActual > diasAnterior ? 'atencion' : 'bien';

  return (
    <>
      <Seccion titulo="Resumen">
        <div className="gr-fila es-3">
          <TarjetaPendiente
            titulo="Pendientes fuera de plazo"
            icono="pi pi-stopwatch"
            cantidad={totalFuera}
            estado={totalFuera === 0 ? 'bien' : totalFuera > 5 ? 'critico' : 'atencion'}
            etiqueta={totalFuera ? 'Fuera de plazo' : 'Al día'}
            detalle={totalFuera ? desgloseFuera : 'Todo se atiende dentro del plazo · meta 0'}
            alAbrir={() => navegar(rutaFuera)}
          />
          <TarjetaMeta titulo={`Boletas firmadas${boletas ? ` · ${boletas.mes}` : ''}`} valor={firmadas} total={enviadas.length} meta={METAS.boletas} unidad="enviadas" alAbrir={() => navegar('/boletas-pago')} />
          <TarjetaMeta titulo="Documentos firmados" valor={docsEnviados.filter((d) => d.estado === 'firmado').length} total={docsEnviados.length} meta={METAS.documentos} unidad="enviados a firma" alAbrir={() => navegar('/documentos')} />
          <TarjetaMeta titulo="Papeletas atendidas el mismo día" valor={mismoDia} total={papeletas30.length} meta={METAS.papeletasMismoDia} unidad="de los últimos 30 días" alAbrir={() => navegar('/papeletas-permiso')} />
          <TarjetaPendiente
            titulo={`Días de descanso médico · ${meses[meses.length - 1].etiqueta}`}
            icono="pi pi-heart"
            cantidad={diasActual}
            estado={estadoDescanso}
            etiqueta={diasAnterior ? `${diasActual >= diasAnterior ? '▲' : '▼'} ${Math.abs(diasActual - diasAnterior)} vs. mes anterior` : 'Sin comparación'}
            detalle={`Mes anterior: ${plural(diasAnterior, 'día', 'días')}. Indicador de ausentismo: lo ideal es que baje.`}
            alAbrir={() => navegar('/descansos-medicos')}
          />
          <TarjetaPendiente
            titulo="Incidencias abiertas"
            icono="pi pi-exclamation-triangle"
            cantidad={abiertas}
            estado={abiertas === 0 ? 'bien' : fueraDePlazo.incidencias ? 'critico' : 'atencion'}
            etiqueta={abiertas === 0 ? 'Al día' : fueraDePlazo.incidencias ? `${fueraDePlazo.incidencias} con más de ${PLAZOS.incidencias} días` : 'En curso'}
            detalle={`${plural(incidenciasMes, 'registrada', 'registradas')} este mes · registradas o en investigación`}
            alAbrir={() => navegar('/incidencias')}
          />
        </div>
      </Seccion>

      <Seccion titulo="Gráficos">
        <div className="gr-graficos">
          <TarjetaGrafico titulo={`Boletas de ${boletas?.mes ?? '…'}`} pregunta="¿Cuánto falta para cerrar el mes?" accion={{ etiqueta: 'Ver boletas', alPresionar: () => navegar('/boletas-pago') }}>
            <Dona
              centro={`${enviadas.length ? Math.round((firmadas / enviadas.length) * 100) : 0}%`}
              subCentro="firmadas"
              alAbrir={() => navegar('/boletas-pago')}
              partes={[
                { etiqueta: 'Firmadas', valor: firmadas, color: COLOR.bien },
                { etiqueta: 'Pendientes de firma', valor: enviadas.length - firmadas, color: COLOR.atencion },
                { etiqueta: 'Sin enviar', valor: sinEnviar, color: COLOR.neutro },
              ]}
            />
          </TarjetaGrafico>

          <TarjetaGrafico titulo="Boletas firmadas por área" pregunta={`¿A qué área hay que recordarle que firme? La línea marca la meta (${METAS.boletas} %).`}>
            <BarrasMeta filas={[...porArea.values()]} meta={METAS.boletas} unidad="boletas" />
          </TarjetaGrafico>

          <TarjetaGrafico titulo="Papeletas de permiso por mes" pregunta="¿Salen más o menos que antes?" accion={{ etiqueta: 'Ver', alPresionar: () => navegar('/papeletas-permiso') }}>
            <ColumnasMes meses={papeletasMes} unidad={['papeleta', 'papeletas']} subirEsMalo />
          </TarjetaGrafico>

          <TarjetaGrafico titulo="Días de descanso médico por mes" pregunta="¿El ausentismo sube o baja?" accion={{ etiqueta: 'Ver', alPresionar: () => navegar('/descansos-medicos') }}>
            <ColumnasMes meses={descansoMes} unidad={['día', 'días']} subirEsMalo />
          </TarjetaGrafico>

          <div className="inicio__ancha">
            <TarjetaGrafico
              titulo={motivos === 'papeletas' ? 'Motivos de papeletas · últimos 3 meses' : 'Motivos de incidencias'}
              pregunta={motivos === 'papeletas' ? '¿Por qué sale más la gente?' : '¿Qué falta se repite más?'}
              extra={
                <Pestanas
                  valor={motivos}
                  alCambiar={setMotivos}
                  opciones={[
                    { valor: 'papeletas', etiqueta: 'Papeletas' },
                    { valor: 'incidencias', etiqueta: 'Incidencias' },
                  ]}
                />
              }
            >
              {motivos === 'papeletas' ? (
                <Ranking datos={motivosPapeletas} vacio="No hay papeletas en los últimos 3 meses." unidad={['papeleta', 'papeletas']} />
              ) : (
                <Ranking datos={motivosIncidencias} vacio="No hay incidencias registradas." unidad={['incidencia', 'incidencias']} />
              )}
            </TarjetaGrafico>
          </div>
        </div>
      </Seccion>
    </>
  );
}

/* ---------- Trabajador y Seguridad ---------- */
function TableroTrabajador({ usuario }: { usuario: UsuarioSesion }) {
  const navegar = useNavigate();
  const papeletas = usePapeletasCompartidas();
  const documentos = useDocumentos();
  const descansos = useListaDescansos();
  const [boletas, setBoletas] = useState<{ firmadas: number; total: number } | null>(null);
  const dni = usuario.dni;

  useEffect(() => {
    if (!dni) return;
    let vigente = true;
    void repositorioBoletas.listarBoletasDe(dni).then((lista) => {
      if (vigente) setBoletas({ firmadas: lista.filter((b) => b.boleta.firma === 'firmada').length, total: lista.length });
    });
    return () => {
      vigente = false;
    };
  }, [dni]);

  const pendientes = pendientesDe(usuario);
  const anio = String(new Date().getFullYear());
  const misPapeletas = papeletas.filter((p) => p.trabajador.dni === dni && p.estado !== 'anulada');
  const misDocumentos = documentos.filter((d) => d.dni === dni && habilitadoParaTrabajador(d));
  const misDescansos = descansos.filter((d) => d.trabajador.dni === dni);
  const diasDescanso = ultimosMeses(12)
    .filter((m) => m.clave.startsWith(anio))
    .reduce((s, m) => s + misDescansos.reduce((t, d) => t + diasEnMes(d, m.clave), 0), 0);
  const salidasHoy = usuario.rol === 'seguridad' ? papeletas.filter((p) => p.estado === 'aprobada' && p.fecha === hoyLocal() && !p.controlSalida).length : 0;

  const papeletasMes: Mes[] = ultimosMeses().map((m) => {
    const del = misPapeletas.filter((p) => p.fecha.startsWith(m.clave));
    return { etiqueta: m.etiqueta, nombre: m.nombre, valor: del.length, detalle: del.length ? del.map((p) => p.motivo).join(' · ') : undefined };
  });

  return (
    <>
      <Seccion titulo="Por atender" ayuda={pendientes.some((p) => p.cantidad) ? 'Toca una tarjeta para resolverlo.' : 'Estás al día.'}>
        <div className="gr-fila">
          {usuario.rol === 'seguridad' && (
            <TarjetaPendiente titulo="Salidas por controlar hoy" icono="pi pi-shield" cantidad={salidasHoy} estado={salidasHoy ? 'atencion' : 'bien'} detalle={salidasHoy ? 'Papeletas autorizadas para hoy' : 'Nada pendiente'} alAbrir={() => navegar('/control-salidas')} />
          )}
          {pendientes.map((p) => (
            <TarjetaPendiente key={p.ruta} titulo={p.titulo} icono={p.icono} cantidad={p.cantidad} estado={p.cantidad ? 'atencion' : 'bien'} detalle={p.cantidad ? p.detalle : 'Nada pendiente'} alAbrir={() => navegar(p.ruta)} />
          ))}
        </div>
      </Seccion>

      <div className="gr-graficos">
        <TarjetaGrafico titulo="Mis boletas de pago" pregunta="¿Tengo boletas sin firmar?" accion={{ etiqueta: 'Ver', alPresionar: () => navegar('/mi-expediente/boletas') }}>
          <Dona
            centro={`${boletas?.total ? Math.round((boletas.firmadas / boletas.total) * 100) : 0}%`}
            subCentro="firmadas"
            alAbrir={() => navegar('/mi-expediente/boletas')}
            partes={[
              { etiqueta: 'Firmadas', valor: boletas?.firmadas ?? 0, color: COLOR.bien },
              { etiqueta: 'Por firmar', valor: (boletas?.total ?? 0) - (boletas?.firmadas ?? 0), color: COLOR.atencion },
            ]}
          />
        </TarjetaGrafico>

        <TarjetaGrafico titulo="Mis papeletas por mes" pregunta="Mis permisos de los últimos 6 meses" accion={{ etiqueta: 'Ver', alPresionar: () => navegar('/papeletas-permiso') }}>
          <ColumnasMes meses={papeletasMes} unidad={['papeleta', 'papeletas']} />
        </TarjetaGrafico>
      </div>

      <Seccion titulo={`Mi año ${anio}`}>
        <dl className="gr-caja inicio__cifras">
          <button type="button" onClick={() => navegar('/mi-expediente/descansos-medicos')}>
            <dt>Días de descanso médico</dt>
            <dd>{diasDescanso}</dd>
            <small>Reconocidos por RR. HH.</small>
          </button>
          <button type="button" onClick={() => navegar('/mi-expediente/documentos')}>
            <dt>Documentos firmados</dt>
            <dd>
              {misDocumentos.filter((d) => d.estado === 'firmado').length} <span>de {misDocumentos.length}</span>
            </dd>
            <small>Contratos, adendas y cargos</small>
          </button>
          <button type="button" onClick={() => navegar('/papeletas-permiso')}>
            <dt>Papeletas aprobadas</dt>
            <dd>{misPapeletas.filter((p) => p.estado === 'aprobada' && p.fecha.startsWith(anio)).length}</dd>
            <small>En lo que va del año</small>
          </button>
        </dl>
      </Seccion>
    </>
  );
}
