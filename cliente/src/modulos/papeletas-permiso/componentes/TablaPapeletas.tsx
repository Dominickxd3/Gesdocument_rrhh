import { useEffect, useState } from 'react';
import { useFilasDisponibles } from '@/compartido/ganchos/useFilasDisponibles';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { puedeResolver, type Papeleta, numeroPapeleta } from '../dominio/papeleta';
import { Avatar, Horario, InsigniaEstado } from './Insignias';

interface Propiedades {
  papeletas: Papeleta[];
  seleccion: Papeleta[];
  alSeleccionar: (seleccion: Papeleta[]) => void;
  alAbrir: (p: Papeleta) => void;
  alAprobar: (p: Papeleta) => void;
  alRechazar: (p: Papeleta) => void;
  alLimpiarFiltros: () => void;
}

const formatoFecha = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' });
const formatoDia = new Intl.DateTimeFormat('es-PE', { weekday: 'short' });

function NumeroFecha({ p }: { p: Papeleta }) {
  const d = new Date(`${p.fecha}T12:00:00`);
  return (
    <div className="pp-fecha">
      <strong>N° {numeroPapeleta(p.numero)}</strong>
      <small>
        {formatoDia.format(d)} {formatoFecha.format(d)}
      </small>
    </div>
  );
}

function Trabajador({ p }: { p: Papeleta }) {
  return (
    <div className="pp-trabajador">
      <Avatar nombre={p.trabajador.nombre} />
      <div>
        <strong>{p.trabajador.nombre}</strong>
        <small>
          DNI {p.trabajador.dni}
        </small>
      </div>
    </div>
  );
}

function Motivo({ p }: { p: Papeleta }) {
  return (
    <div className="pp-motivo">
      <span className="pp-motivo__texto" title={p.motivo}>
        {p.motivo}
      </span>
    </div>
  );
}

export function TablaPapeletas({
  papeletas,
  seleccion,
  alSeleccionar,
  alAbrir,
  alAprobar,
  alRechazar,
  alLimpiarFiltros,
}: Propiedades) {
  const { ref, filas: FILAS } = useFilasDisponibles();
  const [primera, setPrimera] = useState(0);
  useEffect(() => setPrimera(0), [papeletas.length, FILAS]);

  const total = papeletas.length;
  const pagina = Math.floor(primera / FILAS) + 1;
  const totalPaginas = Math.max(1, Math.ceil(total / FILAS));

  // En las pendientes el estado se reemplaza por la decisión: aprobar/rechazar es la tarea más frecuente de RRHH.
  const estadoOAcciones = (p: Papeleta) =>
    puedeResolver(p) ? (
      <div className="pp-acciones" onClick={(e) => e.stopPropagation()}>
        <Button label="Aprobar" icon="pi pi-check" size="small" className="pp-boton-aprobar" onClick={() => alAprobar(p)} />
        <Button
          icon="pi pi-times"
          size="small"
          outlined
          className="pp-boton-rechazar"
          aria-label="Rechazar"
          tooltip="Rechazar"
          tooltipOptions={{ position: 'top' }}
          onClick={() => alRechazar(p)}
        />
      </div>
    ) : (
      <InsigniaEstado estado={p.estado} />
    );

  const vacio = (
    <div className="pp-vacio">
      <i className="pi pi-inbox" aria-hidden="true" />
      <p>No hay papeletas con estos filtros.</p>
      <Button label="Limpiar filtros" text size="small" onClick={alLimpiarFiltros} />
    </div>
  );

  return (
    <div className="pp-tarjeta-tabla" ref={ref}>
      <DataTable responsiveLayout="stack" breakpoint="900px"
        value={papeletas}
        dataKey="id"
        selectionMode="checkbox"
        selection={seleccion}
        onSelectionChange={(e) => alSeleccionar((e.value as Papeleta[]).filter(puedeResolver))}
        isDataSelectable={(e) => puedeResolver(e.data as Papeleta)}
        onRowClick={(e) => alAbrir(e.data as Papeleta)}
        rowClassName={(p: Papeleta) => `pp-fila es-${p.estado}`}
        first={primera}
        rows={FILAS}
        paginator
        paginatorClassName="pp-paginador-oculto"
        onPage={(e) => setPrimera(e.first)}
        emptyMessage={vacio}
        className="pp-tabla"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column field="numero" header="N° · Fecha" sortable body={(p: Papeleta) => <NumeroFecha p={p} />} className="pp-col-fecha" headerClassName="pp-col-fecha" />
        <Column header="Trabajador" body={(p: Papeleta) => <Trabajador p={p} />} />
        <Column header="Área" body={(p: Papeleta) => p.trabajador.area} className="col-area" headerClassName="col-area" />
        <Column header="Motivo" body={(p: Papeleta) => <Motivo p={p} />} className="pp-col-motivo" headerClassName="pp-col-motivo" />
        <Column header="Horario" body={(p: Papeleta) => <Horario papeleta={p} />} className="pp-col-horario" headerClassName="pp-col-horario" />
        <Column header="Estado" body={estadoOAcciones} className="pp-col-estado" headerClassName="pp-col-estado" />
      </DataTable>

      {total > 0 && (
        <footer className="pp-paginacion">
          <span>
            {primera + 1}–{Math.min(primera + FILAS, total)} de {total} papeletas
          </span>
          <div>
            <Button icon="pi pi-angle-left" text rounded aria-label="Anterior" disabled={pagina === 1} onClick={() => setPrimera(primera - FILAS)} />
            <span>
              Página {pagina} de {totalPaginas}
            </span>
            <Button
              icon="pi pi-angle-right"
              text
              rounded
              aria-label="Siguiente"
              disabled={pagina === totalPaginas}
              onClick={() => setPrimera(primera + FILAS)}
            />
          </div>
        </footer>
      )}
    </div>
  );
}
