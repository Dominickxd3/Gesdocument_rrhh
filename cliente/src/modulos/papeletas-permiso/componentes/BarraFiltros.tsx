import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import type { FiltroEstado } from '../dominio/papeleta';
import type { FiltrosPapeletas } from '../aplicacion/usePapeletas';

interface Propiedades {
  filtros: FiltrosPapeletas;
  areas: string[];
  conteo: { todas: number; pendiente: number; aprobada: number; rechazada: number };
  alCambiar: (cambios: Partial<FiltrosPapeletas>) => void;
}

interface OpcionEstado {
  valor: FiltroEstado;
  etiqueta: string;
  cantidad: number;
}

const plantillaEstado = (opcion: OpcionEstado | null) =>
  opcion && (
    <span className="pp-opcion-estado">
      {opcion.etiqueta}
      <span className={`pp-opcion-estado__cantidad${opcion.valor === 'pendiente' && opcion.cantidad > 0 ? ' es-pendiente' : ''}`}>
        {opcion.cantidad}
      </span>
    </span>
  );

/** Una sola fila de filtros: búsqueda, área, estado, periodo y anuladas. */
export function BarraFiltros({ filtros, areas, conteo, alCambiar }: Propiedades) {
  const opcionesEstado: OpcionEstado[] = [
    { valor: 'todas', etiqueta: 'Todas', cantidad: conteo.todas },
    { valor: 'pendiente', etiqueta: 'Pendientes', cantidad: conteo.pendiente },
    { valor: 'aprobada', etiqueta: 'Aprobadas', cantidad: conteo.aprobada },
    { valor: 'rechazada', etiqueta: 'Rechazadas', cantidad: conteo.rechazada },
  ];

  return (
    <div className="pp-filtros__fila">
      <IconField iconPosition="left" className="pp-filtros__busqueda">
        <InputIcon className="pi pi-search" />
        <InputText
          value={filtros.busqueda}
          onChange={(e) => alCambiar({ busqueda: e.target.value })}
          placeholder="Buscar por N°, nombre, DNI o motivo"
          aria-label="Buscar"
        />
      </IconField>
      <Dropdown
        value={filtros.area}
        options={areas}
        onChange={(e) => alCambiar({ area: (e.value as string | undefined) ?? null })}
        placeholder="Todas las áreas"
        aria-label="Área"
        filter
        showClear
        className="pp-filtros__area"
      />
      <Dropdown
        value={filtros.estado}
        options={opcionesEstado}
        optionLabel="etiqueta"
        optionValue="valor"
        onChange={(e) => alCambiar({ estado: e.value as FiltroEstado })}
        itemTemplate={plantillaEstado}
        valueTemplate={(opcion: OpcionEstado | null) => plantillaEstado(opcion)}
        aria-label="Estado"
        disabled={filtros.verAnuladas}
        className="pp-filtros__estado"
      />
      <label className="pp-filtros__anuladas">
        <InputSwitch checked={filtros.verAnuladas} onChange={(e) => alCambiar({ verAnuladas: !!e.value })} />
        Ver anuladas
      </label>
    </div>
  );
}
