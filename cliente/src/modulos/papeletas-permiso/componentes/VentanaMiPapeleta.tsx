import { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { guardarComoPdf, nombreArchivo } from '@/compartido/documentos/guardarComoPdf';
import { BarraFirma, useControlFirma } from '@/compartido/componentes/LienzoFirma';
import { faltaFirmaColaborador, formatearHora, numeroPapeleta, type Papeleta } from '../dominio/papeleta';
import { DetallePapeleta } from './DetallePapeleta';

interface Propiedades {
  papeleta: Papeleta | null;
  alCerrar: () => void;
  /** El colaborador firma su papeleta aprobada (firma dibujada). */
  alFirmar: (papeleta: Papeleta, imagen: string) => void;
}

/**
 * Vista del colaborador: su papeleta aprobada, con el mismo detalle que ve Seguridad.
 * Cuando RR. HH. la aprueba (su visto bueno queda en la papeleta), el colaborador la firma
 * sobre su línea y luego la muestra en vigilancia. Seguridad la evalúa y registra la salida.
 */
export function VentanaMiPapeleta({ papeleta, alCerrar, alFirmar }: Propiedades) {
  const hoja = useRef<HTMLElement>(null);
  const [descargando, setDescargando] = useState(false);
  const control = useControlFirma();
  const { borrar } = control;

  useEffect(() => {
    borrar();
  }, [papeleta?.id, borrar]);

  if (!papeleta) return null;
  const porFirmar = faltaFirmaColaborador(papeleta);

  const descargar = async () => {
    setDescargando(true);
    await guardarComoPdf(hoja.current, nombreArchivo('Papeleta', `N° ${numeroPapeleta(papeleta.numero)}`, papeleta.trabajador.nombre));
    setDescargando(false);
  };

  return (
    <Dialog
      visible
      onHide={alCerrar}
      header={`Papeleta N° ${numeroPapeleta(papeleta.numero)}`}
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
      <DetallePapeleta
        papeleta={papeleta}
        copia="Copia para Colaborador"
        refHoja={hoja}
        controlFirma={porFirmar ? control : undefined}
        bajoLaHoja={
          porFirmar && (
            <div className="dp-barra-firma">
              <BarraFirma
                control={control}
                alEnviar={() => {
                  const imagen = control.imagen();
                  if (imagen) alFirmar(papeleta, imagen);
                }}
              />
            </div>
          )
        }
      >
        {porFirmar ? (
          <p className="dp-estado es-firmar">
            <i className="pi pi-pencil" aria-hidden="true" />
            <span>RR. HH. aprobó tu papeleta. Fírmala sobre la línea "Colaborador" y luego muéstrala en vigilancia al salir.</span>
          </p>
        ) : papeleta.controlSalida ? (
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
