import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './lienzoCroquis.css';

/**
 * Croquis de domicilio dibujado por el trabajador sobre las 12 cuadras del formato GC-RH-F006.
 * Herramientas según las indicaciones del formato: calles/avenidas solo horizontales o verticales,
 * una flecha para señalar la vivienda y mano alzada para detalles.
 * Los puntos se guardan normalizados (0 a 1) para que el dibujo calce sobre las cuadras a cualquier tamaño.
 */

export type HerramientaCroquis = 'calle' | 'flecha' | 'libre' | 'texto';
type Punto = { x: number; y: number };
interface Elemento {
  tipo: HerramientaCroquis;
  puntos: Punto[];
  /** Herramienta "texto": nombre de la avenida, calle o referencia. */
  texto?: string;
}

export interface ControlCroquis {
  elementos: Elemento[];
  herramienta: HerramientaCroquis;
  setHerramienta: (h: HerramientaCroquis) => void;
  vacio: boolean;
  agregar: (e: Elemento) => void;
  deshacer: () => void;
  borrar: () => void;
  /** Lienzo donde se dibuja, para exportar la imagen. */
  lienzo: React.MutableRefObject<HTMLCanvasElement | null>;
  imagen: () => string | null;
}

const COLORES: Record<HerramientaCroquis, string> = { calle: '#1d2b5c', flecha: '#c62828', libre: '#1d2b5c', texto: '#111827' };
const GROSOR: Record<HerramientaCroquis, number> = { calle: 5, flecha: 3.5, libre: 2.5, texto: 1 };

/** Calles y avenidas: solo horizontales o verticales (como pide el formato). */
const recta = (a: Punto, b: Punto): Punto => (Math.abs(b.x - a.x) >= Math.abs(b.y - a.y) ? { x: b.x, y: a.y } : { x: a.x, y: b.y });

function dibujar(ctx: CanvasRenderingContext2D, e: Elemento, ancho: number, alto: number) {
  const p = e.puntos.map((q) => ({ x: q.x * ancho, y: q.y * alto }));
  if (p.length === 0) return;
  const escala = ancho / 640;
  if (e.tipo === 'texto') {
    // Nombre de la avenida o calle, con un borde blanco para que se lea sobre las líneas.
    ctx.font = `bold ${Math.round(15 * escala)}px Arial, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4 * escala;
    ctx.strokeStyle = '#fff';
    ctx.strokeText(e.texto ?? '', p[0].x, p[0].y);
    ctx.fillStyle = COLORES.texto;
    ctx.fillText(e.texto ?? '', p[0].x, p[0].y);
    return;
  }
  ctx.strokeStyle = COLORES[e.tipo];
  ctx.fillStyle = COLORES[e.tipo];
  ctx.lineWidth = GROSOR[e.tipo] * escala;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(p[0].x, p[0].y);
  p.slice(1).forEach((q) => ctx.lineTo(q.x, q.y));
  ctx.stroke();
  if (e.tipo === 'flecha' && p.length > 1) {
    const [a, b] = [p[p.length - 2], p[p.length - 1]];
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const largo = 16 * escala;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - largo * Math.cos(ang - Math.PI / 6), b.y - largo * Math.sin(ang - Math.PI / 6));
    ctx.lineTo(b.x - largo * Math.cos(ang + Math.PI / 6), b.y - largo * Math.sin(ang + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }
}

export function useControlCroquis(): ControlCroquis {
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [herramienta, setHerramienta] = useState<HerramientaCroquis>('calle');
  const lienzo = useRef<HTMLCanvasElement | null>(null);
  const agregar = useCallback((e: Elemento) => setElementos((l) => [...l, e]), []);
  const deshacer = useCallback(() => setElementos((l) => l.slice(0, -1)), []);
  const borrar = useCallback(() => setElementos([]), []);
  return useMemo(
    () => ({
      elementos,
      herramienta,
      setHerramienta,
      vacio: elementos.length === 0,
      agregar,
      deshacer,
      borrar,
      lienzo,
      imagen: () => (elementos.length && lienzo.current ? lienzo.current.toDataURL('image/png') : null),
    }),
    [elementos, herramienta, agregar, deshacer, borrar],
  );
}

/** Capa de dibujo que cubre las cuadras del croquis. */
export function LienzoCroquis({ control }: { control: ControlCroquis }) {
  const caja = useRef<HTMLDivElement>(null);
  const actual = useRef<Elemento | null>(null);
  const [tam, setTam] = useState({ w: 0, h: 0 });
  // Herramienta "texto": cuadro para escribir donde tocó el trabajador.
  const [escribiendo, setEscribiendo] = useState<Punto | null>(null);
  const [texto, setTexto] = useState('');
  const confirmarTexto = () => {
    if (escribiendo && texto.trim()) control.agregar({ tipo: 'texto', puntos: [escribiendo], texto: texto.trim() });
    setEscribiendo(null);
    setTexto('');
  };

  // El lienzo toma el tamaño real de la zona de cuadras (nítido en pantallas de alta densidad).
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const medir = () => setTam({ w: el.clientWidth, h: el.clientHeight });
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const redibujar = useCallback(
    (extra?: Elemento | null) => {
      const c = control.lienzo.current;
      const ctx = c?.getContext('2d');
      if (!c || !ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      [...control.elementos, ...(extra ? [extra] : [])].forEach((e) => dibujar(ctx, e, c.width, c.height));
    },
    [control.elementos, control.lienzo],
  );
  useEffect(() => redibujar(), [redibujar, tam]);

  const punto = (e: React.PointerEvent<HTMLCanvasElement>): Punto => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) };
  };
  const iniciar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = punto(e);
    if (control.herramienta === 'texto') {
      e.preventDefault();
      confirmarTexto();
      setEscribiendo(p);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    actual.current = { tipo: control.herramienta, puntos: [p, p] };
  };
  const mover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const el = actual.current;
    if (!el) return;
    const p = punto(e);
    if (el.tipo === 'libre') el.puntos.push(p);
    else el.puntos = [el.puntos[0], el.tipo === 'calle' ? recta(el.puntos[0], p) : p];
    redibujar(el);
  };
  const terminar = () => {
    const el = actual.current;
    actual.current = null;
    if (!el) return;
    const [a, b] = [el.puntos[0], el.puntos[el.puntos.length - 1]];
    // Un clic sin arrastrar no cuenta como trazo.
    if (Math.hypot(b.x - a.x, b.y - a.y) < 0.01 && el.tipo !== 'libre') return redibujar();
    control.agregar(el);
  };

  const escala = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1;
  return (
    <div className="lienzo-croquis" ref={caja}>
      <canvas
        ref={(c) => {
          control.lienzo.current = c;
        }}
        width={Math.round(tam.w * escala) || 1}
        height={Math.round(tam.h * escala) || 1}
        onPointerDown={iniciar}
        onPointerMove={mover}
        onPointerUp={terminar}
        onPointerCancel={terminar}
        aria-label="Zona para dibujar el croquis"
      />
      {escribiendo && (
        <input
          className="lienzo-croquis__texto"
          style={{ left: `${escribiendo.x * 100}%`, top: `${escribiendo.y * 100}%` }}
          autoFocus
          value={texto}
          maxLength={40}
          placeholder="Ej.: Av. Wiesse"
          aria-label="Nombre de la avenida, calle o referencia"
          onChange={(e) => setTexto(e.target.value)}
          onBlur={confirmarTexto}
          onKeyDown={(e) => {
            if (e.key === 'Enter') confirmarTexto();
            if (e.key === 'Escape') {
              setEscribiendo(null);
              setTexto('');
            }
          }}
        />
      )}
      {control.vacio && !escribiendo && <span className="lienzo-croquis__ayuda">Dibuja aquí tu croquis: calles, avenida principal y una flecha a tu vivienda. Con «Escribir nombre» toca donde quieras poner el nombre de la avenida.</span>}
    </div>
  );
}

/** Herramientas del croquis (sobre la hoja, encima de las cuadras). No se imprimen. */
export function HerramientasCroquis({ control }: { control: ControlCroquis }) {
  const boton = (h: HerramientaCroquis, icono: string, texto: string) => (
    <button type="button" className={control.herramienta === h ? 'es-activa' : ''} aria-pressed={control.herramienta === h} onClick={() => control.setHerramienta(h)}>
      <i className={icono} aria-hidden="true" />
      {texto}
    </button>
  );
  return (
    <div className="herramientas-croquis" role="toolbar" aria-label="Herramientas del croquis">
      {boton('calle', 'pi pi-minus', 'Avenida / calle')}
      {boton('flecha', 'pi pi-arrow-up-right', 'Flecha a mi casa')}
      {boton('libre', 'pi pi-pencil', 'Mano alzada')}
      {boton('texto', 'pi pi-pen-to-square', 'Escribir nombre')}
      <span className="herramientas-croquis__sep" />
      <button type="button" onClick={control.deshacer} disabled={control.vacio} aria-label="Deshacer" title="Deshacer">
        <i className="pi pi-undo" aria-hidden="true" />
      </button>
      <button type="button" onClick={control.borrar} disabled={control.vacio} aria-label="Borrar croquis" title="Borrar todo">
        <i className="pi pi-eraser" aria-hidden="true" />
      </button>
    </div>
  );
}
