import { FiltroFechas } from '@/compartido/componentes/FiltroFechas';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { ESTADOS_DESCANSO, type EstadoDescanso } from '../dominio/descanso';
import type { FiltrosDescansos } from '../aplicacion/useDescansos';

interface Propiedades {
  filtros: FiltrosDescansos;
  areas: string[];
  conteo: Record<EstadoDescanso | 'todos', number>;
  alCambiar: (cambios: Partial<FiltrosDescansos>) => void;
}

interface OpcionEstado {
  valor: EstadoDescanso | 'todos';
  etiqueta: string;
  cantidad: number;
}

const plantilla = (o: OpcionEstado | null) =>
  o && (
    <span className="pp-opcion-estado">
      {o.etiqueta}
      <span className={`pp-opcion-estado__cantidad${o.valor === 'pendiente_revision' && o.cantidad > 0 ? ' es-pendiente' : ''}`}>
        {o.cantidad}
      </span>
    </span>
  );

export function BarraFiltros({ filtros, areas, conteo, alCambiar }: Propiedades) {
  const opciones: OpcionEstado[] = [
    { valor: 'todos', etiqueta: 'Todos', cantidad: conteo.todos },
    ...ESTADOS_DESCANSO.map((e) => ({ valor: e.valor, etiqueta: e.etiqueta, cantidad: conteo[e.valor] })),
  ];

  return (
    <div className="pp-filtros__fila">
      <IconField iconPosition="left" className="pp-filtros__busqueda">
        <InputIcon className="pi pi-search" />
        <InputText
          value={filtros.busqueda}
          onChange={(e) => alCambiar({ busqueda: e.target.value })}
          placeholder="Buscar por N°, nombre o DNI"
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
        options={opciones}
        optionLabel="etiqueta"
        optionValue="valor"
        onChange={(e) => alCambiar({ estado: e.value })}
        itemTemplate={plantilla}
        valueTemplate={(o: OpcionEstado | null) => plantilla(o)}
        aria-label="Estado"
        className="dm-filtro-estado"
      />
      <FiltroFechas valor={filtros.fechas} alCambiar={(fechas) => alCambiar({ fechas })} />
    </div>
  );
}
