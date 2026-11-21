import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './lienzoFirma.css';

/** Medidas internas del lienzo; en pantalla se ajusta al ancho del espacio de firma. */
const ANCHO = 520;
const ALTO = 160;
const MARGEN = 6;
const COLOR = '#1d2b5c';
const GROSOR = 3;

type Punto = { x: number; y: number };
type Trazo = Punto[];

/** Estado de la firma que se está dibujando: trazos, deshacer/rehacer y la imagen final. */
export interface ControlFirma {
  trazos: Trazo[];
  vacia: boolean;
  puedeDeshacer: boolean;
  puedeRehacer: boolean;
  agregarTrazo: (trazo: Trazo) => void;
  deshacer: () => void;
  rehacer: () => void;
  borrar: () => void;
  /** Firma recortada a su trazo (PNG, data URL), para que quede centrada sobre la línea. */
  imagen: () => string | null;
}

function dibujarTrazo(ctx: CanvasRenderingContext2D, trazo: Trazo) {
  if (trazo.length === 0) return;
  ctx.strokeStyle = COLOR;
  ctx.fillStyle = COLOR;
  ctx.lineWidth = GROSOR;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (trazo.length === 1) {
    ctx.beginPath();
    ctx.arc(trazo[0].x, trazo[0].y, GROSOR / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(trazo[0].x, trazo[0].y);
  trazo.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.stroke();
}

function generarImagen(trazos: Trazo[]): string | null {
  const puntos = trazos.flat();
  if (puntos.length === 0) return null;
  const x0 = Math.max(0, Math.min(...puntos.map((p) => p.x)) - MARGEN);
  const y0 = Math.max(0, Math.min(...puntos.map((p) => p.y)) - MARGEN);
  const x1 = Math.min(ANCHO, Math.max(...puntos.map((p) => p.x)) + MARGEN);
  const y1 = Math.min(ALTO, Math.max(...puntos.map((p) => p.y)) + MARGEN);
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.ceil(x1 - x0);
  lienzo.height = Math.ceil(y1 - y0);
  const ctx = lienzo.getContext('2d');
  if (!ctx) return null;
  ctx.translate(-x0, -y0);
  trazos.forEach((t) => dibujarTrazo(ctx, t));
  return lienzo.toDataURL('image/png');
}

/** Crea el control de una firma; deshacer y rehacer funcionan por trazo. */
export function useControlFirma(): ControlFirma {
  const [trazos, setTrazos] = useState<Trazo[]>([]);
  const [rehechos, setRehechos] = useState<Trazo[]>([]);

  const agregarTrazo = useCallback((trazo: Trazo) => {
    setTrazos((t) => [...t, trazo]);
    setRehechos([]);
  }, []);
  const deshacer = useCallback(() => {
    setTrazos((t) => {
      if (t.length === 0) return t;
      setRehechos((r) => [...r, t[t.length - 1]]);
      return t.slice(0, -1);
    });
  }, []);
  const rehacer = useCallback(() => {
    setRehechos((r) => {
      if (r.length === 0) return r;
      setTrazos((t) => [...t, r[r.length - 1]]);
      return r.slice(0, -1);
    });
  }, []);
  const borrar = useCallback(() => {
    setTrazos([]);
    setRehechos([]);
  }, []);

  return useMemo(
    () => ({
      trazos,
      vacia: trazos.length === 0,
      puedeDeshacer: trazos.length > 0,
      puedeRehacer: rehechos.length > 0,
      agregarTrazo,
      deshacer,
      rehacer,
      borrar,
      imagen: () => generarImagen(trazos),
    }),
    [trazos, rehechos, agregarTrazo, deshacer, rehacer, borrar],
  );
}

/**
 * Espacio de firma dentro del propio documento, sobre la línea del trabajador.
 * Se ve como el documento (sin recuadro): solo la indicación "Firme aquí" mientras está vacío.
 */
export function LienzoFirma({ control, etiqueta = 'Firme aquí' }: { control: ControlFirma; etiqueta?: string }) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const actual = useRef<Trazo | null>(null);

  // Redibuja cuando cambian los trazos (dibujar, deshacer, rehacer o borrar).
  useEffect(() => {
    const ctx = lienzo.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, ANCHO, ALTO);
    control.trazos.forEach((t) => dibujarTrazo(ctx, t));
  }, [control.trazos]);

  const punto = (e: React.PointerEvent<HTMLCanvasElement>): Punto => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * ANCHO, y: ((e.clientY - r.top) / r.height) * ALTO };
  };

  const iniciar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    actual.current = [punto(e)];
  };

  const mover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const trazo = actual.current;
    const ctx = e.currentTarget.getContext('2d');
    if (!trazo || !ctx) return;
    const p = punto(e);
    dibujarTrazo(ctx, [trazo[trazo.length - 1], p]);
    trazo.push(p);
  };

  const terminar = () => {
    if (actual.current) control.agregarTrazo(actual.current);
    actual.current = null;
  };

  return (
    <div className="lienzo-firma">
      <canvas
        ref={lienzo}
        width={ANCHO}
        height={ALTO}
        className="lienzo-firma__canvas"
        onPointerDown={iniciar}
        onPointerMove={mover}
        onPointerUp={terminar}
        onPointerCancel={terminar}
        aria-label="Espacio para dibujar tu firma"
      />
      {control.vacia && (
        <span className="lienzo-firma__indicacion" aria-hidden="true">
          {etiqueta}
        </span>
      )}
    </div>
  );
}

interface PropiedadesBarra {
  control: ControlFirma;
  /** Sin zoom (p. ej. la papeleta, que ya se ve a buen tamaño) se ocultan esos botones. */
  zoom?: number;
  alCambiarZoom?: (zoom: number) => void;
  alEnviar: () => void;
  enviando?: boolean;
}

const ZOOM_MIN = 0.5;
/** Hasta 3×: en el celular la hoja se ve reducida y hay que acercarse para firmar cómodo. */
const ZOOM_MAX = 3;
const FACTOR = 1.25;

/**
 * Barra flotante para firmar: deshacer/rehacer por trazo, borrar, zoom del documento y enviar.
 * El botón de enviar se activa cuando hay una firma dibujada.
 */
export function BarraFirma({ control, zoom = 1, alCambiarZoom, alEnviar, enviando = false }: PropiedadesBarra) {
  // Tras cada cambio de zoom se centra el espacio de firma, para no tener que buscarlo.
  const cambiar = (siguiente: number) => {
    alCambiarZoom?.(siguiente);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.querySelector('.lienzo-firma')?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })),
    );
  };
  const ajustar = (factor: number) => cambiar(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(zoom * factor * 100) / 100)));
  return (
    <div className="barra-firma">
      <span className="barra-firma__ayuda">Firme sobre la línea · Deshacer / Rehacer por trazo</span>
      <div className="barra-firma__botones" role="toolbar" aria-label="Herramientas de firma">
        <button type="button" onClick={control.deshacer} disabled={!control.puedeDeshacer} aria-label="Deshacer trazo" title="Deshacer">
          <i className="pi pi-undo" aria-hidden="true" />
        </button>
        <button type="button" onClick={control.rehacer} disabled={!control.puedeRehacer} aria-label="Rehacer trazo" title="Rehacer">
          <i className="pi pi-undo barra-firma__rehacer" aria-hidden="true" />
        </button>
        <span className="barra-firma__separador" />
        <button type="button" className="es-borrar" onClick={control.borrar} disabled={control.vacia} aria-label="Borrar firma" title="Borrar">
          <i className="pi pi-eraser" aria-hidden="true" />
        </button>
        {alCambiarZoom && (
          <>
        <span className="barra-firma__separador" />
        <button type="button" onClick={() => ajustar(1 / FACTOR)} disabled={zoom <= ZOOM_MIN} aria-label="Alejar" title="Alejar">
          <i className="pi pi-search-minus" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => cambiar(1)} disabled={zoom === 1} aria-label="Tamaño original" title="Tamaño original">
          <i className="pi pi-replay" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => ajustar(FACTOR)} disabled={zoom >= ZOOM_MAX} aria-label="Acercar" title="Acercar">
          <i className="pi pi-search-plus" aria-hidden="true" />
        </button>
          </>
        )}
        <span className="barra-firma__separador" />
        <button
          type="button"
          className="barra-firma__enviar"
          onClick={alEnviar}
          disabled={control.vacia || enviando}
          aria-label="Enviar firma"
          title="Enviar firma"
        >
          <i className={enviando ? 'pi pi-spin pi-spinner' : 'pi pi-send'} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
