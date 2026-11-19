import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';

interface Propiedades {
  visible: boolean;
  titulo: string;
  etiqueta?: string;
  ayuda?: string;
  boton: string;
  /** Botón rojo para acciones negativas (rechazar, anular). */
  peligro?: boolean;
  sugerencias?: string[];
  alCerrar: () => void;
  alConfirmar: (texto: string) => void;
}

/** Ventana centrada que pide un texto obligatorio (motivo, observación, conclusión). */
export function VentanaMotivo({ visible, titulo, etiqueta = 'Motivo *', ayuda, boton, peligro, sugerencias = [], alCerrar, alConfirmar }: Propiedades) {
  const [texto, setTexto] = useState('');
  useEffect(() => {
    if (visible) setTexto('');
  }, [visible]);

  return (
    <Dialog
      visible={visible}
      onHide={alCerrar}
      header={titulo}
      className="pp-ventana"
      style={{ width: '480px' }}
      breakpoints={{ '640px': '94vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Cancelar" text onClick={alCerrar} />
          <Button
            label={boton}
            className={peligro ? 'pp-boton-rechazar-lleno' : 'pp-boton-principal'}
            disabled={!texto.trim()}
            onClick={() => alConfirmar(texto.trim())}
          />
        </div>
      }
    >
      <label className="pp-campo">
        <span className="pp-campo__etiqueta">{etiqueta}</span>
        <InputTextarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} autoResize autoFocus maxLength={400} />
        {ayuda && <small className="pp-campo__ayuda">{ayuda}</small>}
      </label>
      {sugerencias.length > 0 && (
        <div className="pp-chips">
          {sugerencias.map((s) => (
            <button key={s} type="button" className="pp-chip" onClick={() => setTexto(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
    </Dialog>
  );
}
