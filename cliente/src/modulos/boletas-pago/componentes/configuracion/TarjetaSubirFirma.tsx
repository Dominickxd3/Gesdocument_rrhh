import { useRef, useState, type DragEvent } from 'react';

interface PropiedadesTarjetaSubirFirma {
  cargando: boolean;
  alElegir: (archivo: File) => void;
}

/** Zona para elegir o arrastrar la imagen PNG de la firma. */
export function TarjetaSubirFirma({ cargando, alElegir }: PropiedadesTarjetaSubirFirma) {
  const selector = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const alSoltar = (evento: DragEvent) => {
    evento.preventDefault();
    setArrastrando(false);
    const archivo = evento.dataTransfer.files[0];
    if (archivo) alElegir(archivo);
  };

  return (
    <section className="tarjeta-configuracion">
      <h2>Subir nueva firma</h2>
      <button
        type="button"
        className={`zona-carga${arrastrando ? ' es-activa' : ''}`}
        disabled={cargando}
        onClick={() => selector.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={alSoltar}
      >
        <i className={cargando ? 'pi pi-spin pi-spinner' : 'pi pi-cloud-upload'} aria-hidden="true" />
        <strong>Seleccionar imagen (PNG)</strong>
        <span>La firma debe estar en formato PNG · máx. 1 MB</span>
      </button>
      <input
        ref={selector}
        type="file"
        accept="image/png"
        hidden
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          e.target.value = '';
          if (archivo) alElegir(archivo);
        }}
      />
    </section>
  );
}
