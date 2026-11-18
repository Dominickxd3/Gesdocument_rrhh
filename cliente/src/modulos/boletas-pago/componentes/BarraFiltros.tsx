import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import type { FiltroEstado, ResumenBoletas } from '../dominio/boleta';
import type { FiltrosBoletas } from '../aplicacion/useBoletas';

interface PropiedadesBarraFiltros {
  filtros: FiltrosBoletas;
  areas: string[];
  resumen: ResumenBoletas;
  /** Boletas del periodo aún no enviadas; 0 oculta el botón de envío masivo. */
  pendientesEnvio: number;
  envioMasivoBloqueado: boolean;
  enviando: boolean;
  alCambiar: (cambios: Partial<FiltrosBoletas>) => void;
  alExportar: () => void;
  alEnviarPendientes: () => void;
}

interface OpcionEstado {
  valor: FiltroEstado;
  etiqueta: string;
  cantidad: number;
}

const plantillaOpcion = (opcion: OpcionEstado | null) =>
  opcion && (
    <span className="opcion-estado">
      {opcion.etiqueta}
      <span className="opcion-estado__cantidad">{opcion.cantidad}</span>
    </span>
  );

export function BarraFiltros({
  filtros,
  areas,
  resumen,
  pendientesEnvio,
  envioMasivoBloqueado,
  enviando,
  alCambiar,
  alExportar,
  alEnviarPendientes,
}: PropiedadesBarraFiltros) {
  const opcionesEstado: OpcionEstado[] = [
    { valor: 'todas', etiqueta: 'Todos los estados', cantidad: resumen.total },
    { valor: 'pendientes_firma', etiqueta: 'Pendientes de firma', cantidad: resumen.pendientesFirma },
    { valor: 'sin_enviar', etiqueta: 'Falta enviar', cantidad: resumen.sinEnviar },
    { valor: 'firmadas', etiqueta: 'Firmadas', cantidad: resumen.firmadas },
  ];

  return (
    <div className="barra-filtros">
      <IconField iconPosition="left" className="barra-filtros__busqueda">
        <InputIcon className="pi pi-search" />
        <InputText
          value={filtros.busqueda}
          onChange={(e) => alCambiar({ busqueda: e.target.value })}
          placeholder="Buscar por nombre o DNI"
          aria-label="Buscar por nombre o DNI"
        />
      </IconField>
      <Dropdown
        value={filtros.area}
        options={areas}
        onChange={(e) => alCambiar({ area: (e.value as string | undefined) ?? null })}
        placeholder="Todas las áreas"
        aria-label="Área"
        filter
        filterPlaceholder="Buscar área"
        showClear
        emptyFilterMessage="Sin coincidencias"
        className="barra-filtros__area"
      />
      <Dropdown
        value={filtros.estado}
        options={opcionesEstado}
        optionValue="valor"
        optionLabel="etiqueta"
        onChange={(e) => alCambiar({ estado: e.value as FiltroEstado })}
        itemTemplate={plantillaOpcion}
        valueTemplate={(opcion: OpcionEstado | null) => plantillaOpcion(opcion)}
        aria-label="Estado"
        className="barra-filtros__estado"
      />

      <div className="barra-filtros__acciones">
        {pendientesEnvio > 0 && (
          <Button
            label={`Enviar ${pendientesEnvio} pendientes`}
            icon="pi pi-send"
            outlined
            className="boton-secundario"
            disabled={envioMasivoBloqueado}
            tooltip={envioMasivoBloqueado ? 'El envío masivo se habilita al cerrar el mes' : undefined}
            tooltipOptions={{ showOnDisabled: true, position: 'top' }}
            loading={enviando}
            onClick={alEnviarPendientes}
          />
        )}
        <Button label="Exportar Excel" icon="pi pi-download" outlined className="boton-secundario" onClick={alExportar} />
      </div>
    </div>
  );
}
