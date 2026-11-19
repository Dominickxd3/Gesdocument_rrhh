import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';

export type TipoMotivo = 'observar' | 'rechazar';

interface Propiedades {
  tipo: TipoMotivo | null;
  alCerrar: () => void;
  alConfirmar: (motivo: string) => void;
}

const CONFIG: Record<TipoMotivo, { titulo: string; ayuda: string; boton: string; clase: string; sugerencias: string[] }> = {
  observar: {
    titulo: 'Solicitar regularización',
    ayuda: 'El trabajador tendrá 1 día hábil para regularizar.',
    boton: 'Observar',
    clase: 'pp-boton-principal',
    sugerencias: ['Falta firma y sello del médico', 'Certificado ilegible', 'Falta el certificado médico o CITT', 'Fechas no coinciden con la ausencia'],
  },
  rechazar: {
    titulo: 'Rechazar descanso médico',
    ayuda: 'El motivo quedará registrado y se comunicará al trabajador.',
    boton: 'Rechazar',
    clase: 'pp-boton-rechazar-lleno',
    sugerencias: ['No se pudo verificar en el portal', 'No regularizó dentro del plazo', 'El sustento no justifica la ausencia'],
  },
};

/** Motivo obligatorio para observar (CUS25) o rechazar (CUS27). */
export function VentanaMotivo({ tipo, alCerrar, alConfirmar }: Propiedades) {
  const [motivo, setMotivo] = useState('');
  useEffect(() => setMotivo(''), [tipo]);
  const c = tipo ? CONFIG[tipo] : null;

  return (
    <Dialog
      visible={!!c}
      onHide={alCerrar}
      header={c?.titulo}
      className="pp-ventana"
      style={{ width: '460px' }}
      breakpoints={{ '640px': '94vw' }}
      draggable={false}
      footer={
        c && (
          <div className="pp-ventana__pie">
            <Button label="Cancelar" text onClick={alCerrar} />
            <Button label={c.boton} className={c.clase} disabled={!motivo.trim()} onClick={() => alConfirmar(motivo.trim())} />
          </div>
        )
      }
    >
      {c && (
        <>
          <label className="pp-campo">
            <span className="pp-campo__etiqueta">Motivo *</span>
            <InputTextarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} autoResize autoFocus maxLength={200} />
            <small className="pp-campo__ayuda">{c.ayuda}</small>
          </label>
          <div className="pp-chips">
            {c.sugerencias.map((s) => (
              <button key={s} type="button" className="pp-chip" onClick={() => setMotivo(s)}>
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </Dialog>
  );
}
