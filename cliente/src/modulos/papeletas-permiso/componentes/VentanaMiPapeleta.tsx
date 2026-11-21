import { useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { guardarComoPdf, nombreArchivo } from '@/compartido/documentos/guardarComoPdf';
import { formatearHora, type Papeleta } from '../dominio/papeleta';
import { DetallePapeleta } from './DetallePapeleta';

/**
 * Vista del colaborador: su papeleta aprobada, con el mismo detalle que ve Seguridad,
 * para mostrarla en vigilancia al salir. Seguridad es quien la evalúa y registra la salida.
 */
export function VentanaMiPapeleta({ papeleta, alCerrar }: { papeleta: Papeleta | null; alCerrar: () => void }) {
  const hoja = useRef<HTMLElement>(null);
  const [descargando, setDescargando] = useState(false);
  if (!papeleta) return null;

  const descargar = async () => {
    setDescargando(true);
    await guardarComoPdf(hoja.current, nombreArchivo('Papeleta', `N° ${String(papeleta.numero).padStart(4, '0')}`, papeleta.trabajador.nombre));
    setDescargando(false);
  };

  return (
    <Dialog
      visible
      onHide={alCerrar}
      header={`Papeleta N° ${papeleta.numero}`}
      modal
      draggable={false}
      resizable={false}
      className="pp-ventana"
      style={{ width: '1120px' }}
      breakpoints={{ '1200px': '96vw', '640px': '100vw' }}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Descargar PDF" icon="pi pi-download" outlined className="pp-boton-secundario" loading={descargando} onClick={() => void descargar()} />
          <span className="pp-espaciador" />
          <Button label="Cerrar" className="pp-boton-principal" onClick={alCerrar} />
        </div>
      }
    >
      <DetallePapeleta papeleta={papeleta} copia="Copia para Colaborador" refHoja={hoja}>
        {papeleta.controlSalida ? (
          <p className="dp-estado es-registrada">
            <i className="pi pi-check-circle" aria-hidden="true" />
            <span>
              Seguridad registró tu salida a las <strong>{formatearHora(papeleta.controlSalida.hora)}</strong>.
            </span>
          </p>
        ) : (
          <p className="dp-estado">
            <i className="pi pi-shield" aria-hidden="true" />
            <span>Muestra esta papeleta en vigilancia al salir. Seguridad la verificará y registrará tu hora de salida.</span>
          </p>
        )}
      </DetallePapeleta>
    </Dialog>
  );
}
