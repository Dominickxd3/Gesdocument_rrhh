import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';

interface Propiedades {
  /** Cantidad de papeletas a rechazar; 0 = cerrada. */
  cantidad: number;
  alCerrar: () => void;
  alConfirmar: (motivo: string) => void;
}

const SUGERENCIAS = ['No adjuntó sustento', 'Fecha u horario incorrecto', 'Excede las horas permitidas', 'Debe solicitarlo como vacaciones'];

/** El motivo es obligatorio: el trabajador y su jefe deben saber por qué se rechazó. */
export function VentanaRechazo({ cantidad, alCerrar, alConfirmar }: Propiedades) {
  const [motivo, setMotivo] = useState('');
  useEffect(() => setMotivo(''), [cantidad]);

  return (
    <Dialog
      visible={cantidad > 0}
      onHide={alCerrar}
      header={cantidad === 1 ? 'Rechazar papeleta' : `Rechazar ${cantidad} papeletas`}
      className="pp-ventana pp-ventana--chica"
      style={{ width: '460px' }}
      breakpoints={{ '640px': '94vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Cancelar" text onClick={alCerrar} />
          <Button
            label="Rechazar"
            icon="pi pi-times"
            className="pp-boton-rechazar-lleno"
            disabled={!motivo.trim()}
            onClick={() => alConfirmar(motivo.trim())}
          />
        </div>
      }
    >
      <label className="pp-campo">
        <span className="pp-campo__etiqueta">Motivo del rechazo *</span>
        <InputTextarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} autoResize autoFocus maxLength={200} />
      </label>
      <div className="pp-chips">
        {SUGERENCIAS.map((s) => (
          <button key={s} type="button" className="pp-chip" onClick={() => setMotivo(s)}>
            {s}
          </button>
        ))}
      </div>
    </Dialog>
  );
}
