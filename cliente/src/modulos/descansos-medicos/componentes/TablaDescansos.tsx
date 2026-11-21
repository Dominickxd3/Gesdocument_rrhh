import { useEffect, useState } from 'react';
import { useFilasDisponibles } from '@/compartido/ganchos/useFilasDisponibles';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { etiquetaTipo, fechaCorta, type Descanso } from '../dominio/descanso';
import { Avatar, InsigniaEstado, Plazo } from './Insignias';

interface Propiedades {
  descansos: Descanso[];
  alAbrir: (d: Descanso) => void;
  alLimpiarFiltros: () => void;
}


function Trabajador({ d }: { d: Descanso }) {
  return (
    <div className="pp-trabajador">
      <Avatar nombre={d.trabajador.nombre} />
      <div>
        <strong>{d.trabajador.nombre}</strong>
        <small>
          DNI {d.trabajador.dni}
        </small>
      </div>
    </div>
  );
}

function Periodo({ d }: { d: Descanso }) {
  return (
    <span className="dm-periodo">
      {fechaCorta(d.inicio)} – {fechaCorta(d.fin)}
    </span>
  );
}

export function TablaDescansos({ descansos, alAbrir, alLimpiarFiltros }: Propiedades) {
  // Tantas filas como quepan en la pantalla: sin hueco bajo la tabla.
  const { ref, filas: FILAS } = useFilasDisponibles();
  const [primera, setPrimera] = useState(0);
  useEffect(() => setPrimera(0), [descansos.length, FILAS]);

  const total = descansos.length;
  const pagina = Math.floor(primera / FILAS) + 1;
  const totalPaginas = Math.max(1, Math.ceil(total / FILAS));

  return (
    <div className="pp-tarjeta-tabla" ref={ref}>
      <DataTable
        value={descansos}
        dataKey="id"
        onRowClick={(e) => alAbrir(e.data as Descanso)}
        rowClassName={(d: Descanso) => `pp-fila dm-fila es-${d.estado}`}
        first={primera}
        rows={FILAS}
        paginator
        paginatorClassName="pp-paginador-oculto"
        onPage={(e) => setPrimera(e.first)}
        emptyMessage={
          <div className="pp-vacio">
            <i className="pi pi-inbox" aria-hidden="true" />
            <p>No hay descansos médicos con estos filtros.</p>
            <Button label="Limpiar filtros" text size="small" onClick={alLimpiarFiltros} />
          </div>
        }
        className="pp-tabla"
      >
        <Column header="N°" body={(d: Descanso) => <strong>{d.numero}</strong>} className="pp-col-fecha" headerClassName="pp-col-fecha" />
        <Column header="Trabajador" body={(d: Descanso) => <Trabajador d={d} />} />
        <Column header="Área" body={(d: Descanso) => d.trabajador.area} className="col-area" headerClassName="col-area" />
        <Column header="Periodo" body={(d: Descanso) => <Periodo d={d} />} className="pp-col-horario" headerClassName="pp-col-horario" />
        <Column header="Tipo" body={(d: Descanso) => etiquetaTipo(d.tipo)} className="dm-col-tipo" headerClassName="dm-col-tipo" />
        <Column header="Plazo" body={(d: Descanso) => <Plazo descanso={d} />} className="pp-col-estado" headerClassName="pp-col-estado" />
        <Column header="Estado" body={(d: Descanso) => <InsigniaEstado estado={d.estado} />} className="pp-col-estado" headerClassName="pp-col-estado" />
      </DataTable>

      {total > 0 && (
        <footer className="pp-paginacion">
          <span>
            {primera + 1}–{Math.min(primera + FILAS, total)} de {total} descansos
          </span>
          <div>
            <Button icon="pi pi-angle-left" text rounded aria-label="Anterior" disabled={pagina === 1} onClick={() => setPrimera(primera - FILAS)} />
            <span>
              Página {pagina} de {totalPaginas}
            </span>
            <Button icon="pi pi-angle-right" text rounded aria-label="Siguiente" disabled={pagina === totalPaginas} onClick={() => setPrimera(primera + FILAS)} />
          </div>
        </footer>
      )}
    </div>
  );
}
