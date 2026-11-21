import { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import './padFirma.css';

interface Propiedades {
  visible: boolean;
  titulo?: string;
  alCerrar: () => void;
  /** Devuelve la firma como imagen PNG (data URL, fondo transparente). */
  alFirmar: (imagen: string) => void;
}

const ANCHO = 520;
const ALTO = 200;

/**
 * Ventana para que el trabajador dibuje su firma con el mouse, el dedo o un lápiz.
 * La imagen resultante es la que aparece sobre su línea en el documento.
 */
export function PadFirma({ visible, titulo = 'Dibuja tu firma', alCerrar, alFirmar }: Propiedades) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const ultimo = useRef<{ x: number; y: number } | null>(null);
  const [vacio, setVacio] = useState(true);

  const limpiar = () => {
    const c = lienzo.current;
    c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    setVacio(true);
  };

  useEffect(() => {
    if (visible) setTimeout(limpiar, 0);
  }, [visible]);

  const punto = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * ANCHO, y: ((e.clientY - r.top) / r.height) * ALTO };
  };

  const iniciar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dibujando.current = true;
    ultimo.current = punto(e);
  };

  const mover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dibujando.current || !ultimo.current) return;
    const ctx = e.currentTarget.getContext('2d');
    if (!ctx) return;
    const p = punto(e);
    ctx.strokeStyle = '#1d2b5c';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(ultimo.current.x, ultimo.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ultimo.current = p;
    setVacio(false);
  };

  const terminar = () => {
    dibujando.current = false;
    ultimo.current = null;
  };

  return (
    <Dialog
      visible={visible}
      onHide={alCerrar}
      header={titulo}
      className="pp-ventana pad-firma"
      style={{ width: '580px' }}
      breakpoints={{ '640px': '96vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Borrar" icon="pi pi-eraser" text onClick={limpiar} disabled={vacio} />
          <span className="pp-espaciador" />
          <Button label="Cancelar" text onClick={alCerrar} />
          <Button
            label="Firmar"
            icon="pi pi-pencil"
            className="pp-boton-aprobar"
            disabled={vacio}
            onClick={() => lienzo.current && alFirmar(lienzo.current.toDataURL('image/png'))}
          />
        </div>
      }
    >
      <p className="pad-firma__ayuda">Firma dentro del recuadro con el mouse, el dedo o un lápiz. Así aparecerá en el documento.</p>
      <canvas
        ref={lienzo}
        width={ANCHO}
        height={ALTO}
        className="pad-firma__lienzo"
        onPointerDown={iniciar}
        onPointerMove={mover}
        onPointerUp={terminar}
        onPointerLeave={terminar}
        aria-label="Recuadro para dibujar la firma"
      />
      <div className="pad-firma__linea">Firma del trabajador</div>
    </Dialog>
  );
}
