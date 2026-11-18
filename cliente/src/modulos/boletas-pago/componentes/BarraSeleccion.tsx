import { Button } from 'primereact/button';

interface PropiedadesBarraSeleccion {
  cantidad: number;
  envioMasivoBloqueado: boolean;
  enviando: boolean;
  alEnviar: () => void;
  alExportar: () => void;
  alQuitar: () => void;
}

/** Barra flotante con acciones para las boletas seleccionadas. */
export function BarraSeleccion({
  cantidad,
  envioMasivoBloqueado,
  enviando,
  alEnviar,
  alExportar,
  alQuitar,
}: PropiedadesBarraSeleccion) {
  if (cantidad === 0) return null;

  return (
    <div className="barra-seleccion" role="region" aria-label="Acciones de la selección">
      <span className="barra-seleccion__cantidad">
        {cantidad} {cantidad === 1 ? 'seleccionada' : 'seleccionadas'}
      </span>
      <Button
        label="Enviar"
        icon="pi pi-send"
        size="small"
        outlined
        className="boton-secundario"
        disabled={envioMasivoBloqueado}
        tooltip={envioMasivoBloqueado ? 'El envío masivo se habilita al cerrar el mes' : undefined}
        tooltipOptions={{ showOnDisabled: true, position: 'top' }}
        loading={enviando}
        onClick={alEnviar}
      />
      <Button label="Exportar" icon="pi pi-download" size="small" outlined className="boton-secundario" onClick={alExportar} />
      <Button icon="pi pi-times" size="small" text rounded aria-label="Quitar selección" className="barra-seleccion__cerrar" onClick={alQuitar} />
    </div>
  );
}
