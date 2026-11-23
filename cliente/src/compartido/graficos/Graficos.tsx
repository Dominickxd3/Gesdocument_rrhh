import { useState, type ReactNode } from 'react';
import './graficos.css';

/**
 * Piezas del tablero de Inicio, pensadas para leerse de un vistazo:
 *  - Semáforo: verde = bien, ámbar = atención, rojo = crítico. Siempre con ícono y texto, nunca solo color.
 *  - Dona solo para partes de un total (máximo 3 partes); barras para comparar; columnas para ver tendencia.
 *  - Cada pieza responde una pregunta concreta y abre su módulo al hacer clic.
 */

export type Semaforo = 'bien' | 'atencion' | 'critico';

const SEMAFORO: Record<Semaforo, { icono: string; texto: string }> = {
  bien: { icono: 'pi pi-check-circle', texto: 'Bueno' },
  atencion: { icono: 'pi pi-exclamation-circle', texto: 'Intermedio' },
  critico: { icono: 'pi pi-times-circle', texto: 'En riesgo' },
};

/** Colores de cada estado del semáforo (también los usan la dona y las barras). */
export const COLOR: Record<Semaforo | 'neutro', string> = { bien: '#15803d', atencion: '#d97706', critico: '#b91c1c', neutro: '#9ca3af' };

/** Semáforo de un porcentaje frente a su meta: a menos de 15 puntos es "cerca". */
export const estadoMeta = (pct: number, meta: number): Semaforo => (pct >= meta ? 'bien' : pct >= meta - 15 ? 'atencion' : 'critico');

const pctDe = (valor: number, total: number) => (total ? Math.round((valor / total) * 100) : 100);

export function Etiqueta({ estado, texto }: { estado: Semaforo; texto?: string }) {
  return (
    <span className={`gr-etiqueta es-${estado}`}>
      <i className={SEMAFORO[estado].icono} aria-hidden="true" />
      {texto ?? SEMAFORO[estado].texto}
    </span>
  );
}

/* ---------- Indicador con un número y su semáforo ---------- */
export function TarjetaPendiente({
  titulo,
  cantidad,
  icono,
  estado,
  etiqueta,
  detalle,
  alAbrir,
}: {
  titulo: string;
  cantidad: ReactNode;
  icono: string;
  estado: Semaforo;
  /** Texto de la etiqueta del semáforo; por defecto "Al día", "Atención" o "Urgente". */
  etiqueta?: string;
  /** Una frase que explique el número. */
  detalle: ReactNode;
  alAbrir: () => void;
}) {
  return (
    <button type="button" className={`gr-pendiente es-${estado}`} onClick={alAbrir}>
      <span className="gr-pendiente__cabeza">
        <i className={icono} aria-hidden="true" />
        <span>{titulo}</span>
      </span>
      <span className="gr-pendiente__cuerpo">
        <strong>{cantidad}</strong>
        <Etiqueta estado={estado} texto={etiqueta} />
      </span>
      <small>{detalle}</small>
    </button>
  );
}

/* ---------- Indicador de porcentaje contra una meta ---------- */
export function TarjetaMeta({
  titulo,
  valor,
  total,
  meta,
  unidad,
  detalle,
  alAbrir,
}: {
  titulo: string;
  valor: number;
  total: number;
  /** Meta en porcentaje (0–100). */
  meta: number;
  unidad: string;
  /** Texto bajo la barra; por defecto, cantidades, meta y lo que falta. */
  detalle?: ReactNode;
  alAbrir?: () => void;
}) {
  const pct = pctDe(valor, total);
  const estado = estadoMeta(pct, meta);
  const faltan = Math.max(0, Math.ceil((meta / 100) * total) - valor);
  return (
    <button type="button" className={`gr-meta es-${estado}`} onClick={alAbrir} disabled={!alAbrir}>
      <span className="gr-meta__titulo">{titulo}</span>
      <span className="gr-meta__cifra">
        <strong>{pct}%</strong>
        <Etiqueta estado={estado} texto={estado === 'bien' ? 'En meta' : estado === 'atencion' ? 'Cerca de la meta' : 'Bajo la meta'} />
      </span>
      <span className="gr-meta__pista" role="img" aria-label={`${pct} % de ${meta} % de meta`}>
        <span className="gr-meta__barra" style={{ width: `${Math.min(100, pct)}%` }} />
        <span className="gr-meta__linea" style={{ left: `${meta}%` }} title={`Meta ${meta} %`} />
      </span>
      <small>
        {detalle ?? (
          <>
            {valor} de {total} {unidad} · meta {meta} %{faltan > 0 && <> · <b>faltan {faltan}</b></>}
          </>
        )}
      </small>
    </button>
  );
}

/* ---------- Tarjeta que contiene un gráfico ---------- */
export function TarjetaGrafico({ titulo, pregunta, accion, children, extra }: { titulo: string; pregunta?: string; accion?: { etiqueta: string; alPresionar: () => void }; children: ReactNode; extra?: ReactNode }) {
  return (
    <section className="gr-tarjeta">
      <header className="gr-tarjeta__cabeza">
        <div>
          <h3>{titulo}</h3>
          {pregunta && <p>{pregunta}</p>}
        </div>
        {extra}
        {accion && (
          <button type="button" className="gr-tarjeta__accion" onClick={accion.alPresionar}>
            {accion.etiqueta} <i className="pi pi-angle-right" aria-hidden="true" />
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

/* ---------- Dona: partes de un total (máximo 3) ---------- */
export interface ParteDona {
  etiqueta: string;
  valor: number;
  color: string;
}

export function Dona({ partes, centro, subCentro, alAbrir }: { partes: ParteDona[]; centro: string; subCentro: string; alAbrir?: () => void }) {
  const [activa, setActiva] = useState<number | null>(null);
  const total = partes.reduce((s, p) => s + p.valor, 0);
  const r = 52;
  const largo = 2 * Math.PI * r;
  // Separación de 2 px entre partes para que se distingan.
  const hueco = partes.filter((p) => p.valor).length > 1 ? 2 : 0;
  let acumulado = 0;
  const parte = activa !== null ? partes[activa] : null;

  return (
    <div className="gr-dona" onMouseLeave={() => setActiva(null)}>
      <svg viewBox="0 0 132 132" className="gr-dona__svg" role="img" aria-label={partes.map((p) => `${p.etiqueta}: ${p.valor}`).join(', ')} onClick={alAbrir}>
        <circle cx="66" cy="66" r={r} fill="none" stroke="#eef0f3" strokeWidth="16" />
        {partes.map((p, i) => {
          const tramo = total ? (p.valor / total) * largo : 0;
          const inicio = acumulado;
          acumulado += tramo;
          if (!tramo) return null;
          return (
            <circle
              key={p.etiqueta}
              cx="66"
              cy="66"
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth={activa === i ? 20 : 16}
              strokeDasharray={`${Math.max(0, tramo - hueco)} ${largo}`}
              strokeDashoffset={-inicio}
              transform="rotate(-90 66 66)"
              className="gr-dona__parte"
              onMouseEnter={() => setActiva(i)}
            />
          );
        })}
        <text x="66" y="66" textAnchor="middle" className="gr-dona__centro">
          {parte ? `${pctDe(parte.valor, total)}%` : centro}
        </text>
        <text x="66" y="84" textAnchor="middle" className="gr-dona__sub">
          {parte ? parte.etiqueta.toLowerCase() : subCentro}
        </text>
      </svg>
      <ul className="gr-leyenda">
        {partes.map((p, i) => (
          <li key={p.etiqueta} className={activa === i ? 'es-activa' : ''} onMouseEnter={() => setActiva(i)}>
            <span className="gr-leyenda__marca" style={{ background: p.color }} />
            <span className="gr-leyenda__texto">{p.etiqueta}</span>
            <strong>{p.valor}</strong>
            <small>{pctDe(p.valor, total)}%</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Barras de porcentaje contra una meta (de peor a mejor) ---------- */
export interface FilaPorcentaje {
  etiqueta: string;
  valor: number;
  total: number;
}

/** Colores para distinguir elementos (áreas, meses). Orden fijo; cada elemento conserva su color. */
export const PALETA = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#6250d6', '#0f8b8d', '#a0522d'];

export function BarrasMeta({ filas, meta, unidad, ordenado = false, colorDe }: { filas: FilaPorcentaje[]; meta: number; unidad: string; /** Respeta el orden recibido. */ ordenado?: boolean; /** Color propio de cada fila (si no, el del semáforo). */ colorDe?: (etiqueta: string) => string }) {
  const ordenadas = ordenado ? filas : [...filas].sort((a, b) => pctDe(a.valor, a.total) - pctDe(b.valor, b.total) || a.etiqueta.localeCompare(b.etiqueta, 'es'));
  return (
    <ul className="gr-barras-meta">
      {ordenadas.map((f) => {
        const pct = pctDe(f.valor, f.total);
        const estado = estadoMeta(pct, meta);
        return (
          <li key={f.etiqueta} title={`${f.etiqueta}: ${f.valor} de ${f.total} ${unidad} (${pct} %)`}>
            <span className="gr-barras-meta__nombre">{f.etiqueta}</span>
            <span className="gr-barras-meta__pista">
              <span className={`gr-barras-meta__barra es-${estado}`} style={{ width: `${pct}%`, background: colorDe?.(f.etiqueta) }} />
              <span className="gr-barras-meta__linea" style={{ left: `${meta}%` }} />
            </span>
            <strong className={`gr-barras-meta__valor es-${estado}`}>{pct}%</strong>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Columnas por mes (tendencia) ---------- */
export interface Mes {
  etiqueta: string;
  /** Nombre largo para el detalle: "Noviembre 2026". */
  nombre: string;
  valor: number;
  detalle?: string;
  /** Color propio de la barra. */
  color?: string;
}

export function ColumnasMes({ meses, unidad, semaforo = false, resumen = true, conUnidad = false }: { meses: Mes[]; unidad: [string, string]; /** Escribe la unidad junto a cada cifra: "43 días". */ conUnidad?: boolean; /** Colorea cada mes frente al promedio (más es peor). */ semaforo?: boolean; /** Muestra la cifra del último mes y su variación. */ resumen?: boolean }) {
  const promedio = meses.reduce((s, m) => s + m.valor, 0) / Math.max(1, meses.length);
  const colorDe = (v: number): Semaforo => (v <= promedio ? "bien" : v <= promedio * 1.15 ? "atencion" : "critico");
  const [activo, setActivo] = useState<number | null>(null);
  const maximo = Math.max(1, ...meses.map((m) => m.valor));
  const actual = meses[meses.length - 1];
  const anterior = meses[meses.length - 2];
  const variacion = anterior?.valor ? Math.round(((actual.valor - anterior.valor) / anterior.valor) * 100) : null;
  const sube = (variacion ?? 0) > 0;
  const elegido = activo !== null ? meses[activo] : null;
  const u = (n: number) => (n === 1 ? unidad[0] : unidad[1]);

  return (
    <div className="gr-columnas">
      {resumen && (
      <p className="gr-columnas__resumen">
        <strong>{actual.valor}</strong> {u(actual.valor)} en {actual.nombre.toLowerCase()}
        {variacion !== null && <span className="gr-columnas__variacion">{`${sube ? '+' : variacion < 0 ? '−' : ''}${Math.abs(variacion)} % vs. mes anterior`}</span>}
      </p>
      )}
      <div className="gr-columnas__area" onMouseLeave={() => setActivo(null)}>
        {meses.map((m, i) => (
          <button
            key={m.etiqueta}
            type="button"
            className={`gr-columnas__mes${i === meses.length - 1 ? ' es-actual' : ''}${activo === i ? ' es-activo' : ''}`}
            onMouseEnter={() => setActivo(i)}
            onFocus={() => setActivo(i)}
            onClick={() => setActivo(i)}
            aria-label={`${m.nombre}: ${m.valor} ${u(m.valor)}`}
          >
            <span className="gr-columnas__zona">
              <span className="gr-columnas__valor">{conUnidad ? `${m.valor} ${u(m.valor)}` : m.valor}</span>
              <span className={`gr-columnas__barra${semaforo ? ` es-${colorDe(m.valor)}` : ""}`} style={{ height: `${(m.valor / maximo) * 85}%`, background: m.color }} />
            </span>
            <span className="gr-columnas__eje">{m.etiqueta}</span>
          </button>
        ))}
      </div>
      {meses.some((m) => m.detalle) && (
        <p className="gr-columnas__detalle" aria-live="polite">
          {elegido ? (
            <>
              <b>{elegido.nombre}:</b> {elegido.valor} {u(elegido.valor)}
              {elegido.detalle && ` · ${elegido.detalle}`}
            </>
          ) : (
            'Toca un mes para ver el detalle.'
          )}
        </p>
      )}
    </div>
  );
}

/* ---------- Ranking (los más frecuentes) ---------- */
export interface FilaRanking {
  etiqueta: string;
  valor: number;
}

export function Ranking({ datos, vacio, unidad }: { datos: FilaRanking[]; vacio: string; unidad: [string, string] }) {
  const maximo = Math.max(1, ...datos.map((d) => d.valor));
  const total = datos.reduce((s, d) => s + d.valor, 0);
  if (!datos.length) return <p className="gr-vacio">{vacio}</p>;
  return (
    <ol className="gr-ranking">
      {datos.map((d) => (
        <li key={d.etiqueta} className={d.valor === maximo ? 'es-primero' : ''} title={`${d.etiqueta}: ${d.valor} ${d.valor === 1 ? unidad[0] : unidad[1]}`}>
          <span className="gr-ranking__nombre">{d.etiqueta}</span>
          <span className="gr-ranking__pista">
            <span className="gr-ranking__barra" style={{ width: `${(d.valor / maximo) * 100}%` }} />
          </span>
          <strong className="gr-ranking__valor">{d.valor}</strong>
          <small className="gr-ranking__detalle">{pctDe(d.valor, total)}% del total</small>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Pestañas pequeñas dentro de una tarjeta ---------- */
export function Pestanas<T extends string>({ opciones, valor, alCambiar }: { opciones: { valor: T; etiqueta: string }[]; valor: T; alCambiar: (v: T) => void }) {
  return (
    <div className="gr-pestanas" role="tablist">
      {opciones.map((o) => (
        <button key={o.valor} type="button" role="tab" aria-selected={valor === o.valor} className={valor === o.valor ? 'es-activa' : ''} onClick={() => alCambiar(o.valor)}>
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}

/* ---------- Leyenda del semáforo ---------- */
export function LeyendaSemaforo() {
  return (
    <ul className="gr-leyenda-sem" aria-label="Significado de los colores">
      <li className="es-bien">Bueno</li>
      <li className="es-atencion">Intermedio</li>
      <li className="es-critico">Bajo o en riesgo</li>
    </ul>
  );
}

/* ---------- Contenedor de sección ---------- */
export function Seccion({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: ReactNode }) {
  return (
    <section className="gr-seccion">
      <header>
        <h2>{titulo}</h2>
        {ayuda && <p>{ayuda}</p>}
      </header>
      {children}
    </section>
  );
}
