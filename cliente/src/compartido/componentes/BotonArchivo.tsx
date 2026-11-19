import { useRef } from 'react';
import { Button } from 'primereact/button';

/**
 * Archivos subidos durante la sesión del prototipo (nombre → URL local), para poder abrirlos.
 * En producción se suben al servidor.
 */
const archivos = new Map<string, { url: string; tipo: string }>();

export const archivoSubido = (nombre: string | undefined) => (nombre ? archivos.get(nombre) : undefined);

/** Botón que abre el selector de archivos y devuelve el nombre del archivo elegido. */
export function BotonArchivo({
  etiqueta = 'Adjuntar',
  icono = 'pi pi-upload',
  aceptar = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  clase,
  alElegir,
}: {
  etiqueta?: string;
  icono?: string;
  aceptar?: string;
  clase?: string;
  alElegir: (nombre: string) => void;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={entrada}
        type="file"
        accept={aceptar}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            archivos.set(f.name, { url: URL.createObjectURL(f), tipo: f.type });
            alElegir(f.name);
          }
          e.target.value = '';
        }}
      />
      <Button label={etiqueta} icon={icono} text={!clase} size={clase ? undefined : 'small'} className={clase} onClick={() => entrada.current?.click()} />
    </>
  );
}
