import { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { guardarComoPdf, nombreArchivo } from '@/compartido/documentos/guardarComoPdf';
import { formatearHora, type Papeleta } from '@/modulos/papeletas-permiso/dominio/papeleta';
import { DetallePapeleta } from '@/modulos/papeletas-permiso/componentes/DetallePapeleta';

interface Propiedades {
  papeleta: Papeleta | null;
  alCerrar: () => void;
  alRegistrar: (papeleta: Papeleta, hora: string, nota: string) => void;
}

const horaActual = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * CUS17–CUS18: Seguridad evalúa la papeleta ("Copia para Vigilancia") y los datos del colaborador,
 * y registra la hora de salida observada. No ve diagnósticos ni boletas (RNF02).
 */
export function VentanaRegistroSalida({ papeleta, alCerrar, alRegistrar }: Propiedades) {
  const [hora, setHora] = useState(horaActual);
  const [nota, setNota] = useState('');
  const [descargando, setDescargando] = useState(false);
  const hoja = useRef<HTMLElement>(null);

  useEffect(() => {
    if (papeleta) {
      setHora(papeleta.controlSalida?.hora ?? horaActual());
      setNota(papeleta.controlSalida?.nota ?? '');
    }
  }, [papeleta]);

  if (!papeleta) return null;
  const registrada = !!papeleta.controlSalida;

  const descargar = async () => {
    setDescargando(true);
    await guardarComoPdf(hoja.current, nombreArchivo('Papeleta', `N° ${String(papeleta.numero).padStart(4, '0')}`, papeleta.trabajador.nombre));
    setDescargando(false);
  };

  const pie = (
    <div className="pp-ventana__pie">
      <Button label="Descargar PDF" icon="pi pi-download" text className="pp-boton-texto" loading={descargando} onClick={() => void descargar()} />
      <span className="pp-espaciador" />
      <Button label={registrada ? 'Cerrar' : 'Cancelar'} text className="pp-boton-texto" onClick={alCerrar} />
      {!registrada && (
        <Button
          label="Registrar salida"
          icon="pi pi-sign-out"
          className="pp-boton-principal"
          disabled={!hora}
          onClick={() => alRegistrar(papeleta, hora, nota)}
        />
      )}
    </div>
  );

  return (
    <Dialog
      visible
      onHide={alCerrar}
      header={`Papeleta N° ${papeleta.numero}`}
      footer={pie}
      modal
      draggable={false}
      resizable={false}
      className="pp-ventana cs-ventana"
      style={{ width: '1120px' }}
      breakpoints={{ '1200px': '96vw', '640px': '100vw' }}
    >
      <DetallePapeleta papeleta={papeleta} copia="Copia para Vigilancia" refHoja={hoja}>
        {registrada ? (
          <div className="cs-registro">
            <i className="pi pi-check-circle" aria-hidden="true" />
            <span>
              Salió a las <strong>{formatearHora(papeleta.controlSalida!.hora)}</strong> · registrado por {papeleta.controlSalida!.usuario}
              {papeleta.controlSalida!.nota && <em> · {papeleta.controlSalida!.nota}</em>}
            </span>
          </div>
        ) : (
          <div className="cs-formulario">
            <label className="pp-campo">
              <span className="pp-campo__etiqueta">Hora de salida observada *</span>
              <input type="time" className="p-inputtext" value={hora} onChange={(e) => setHora(e.target.value)} />
            </label>
            <label className="pp-campo">
              <span className="pp-campo__etiqueta">Observación (opcional)</span>
              <InputTextarea value={nota} onChange={(e) => setNota(e.target.value)} rows={2} maxLength={200} autoResize placeholder="Ej.: salió con su jefe inmediato" />
            </label>
          </div>
        )}
      </DetallePapeleta>
    </Dialog>
  );
}
