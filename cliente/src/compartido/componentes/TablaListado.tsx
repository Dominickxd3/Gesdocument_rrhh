import { useEffect, useState, type ReactNode } from 'react';
import { DataTable, type DataTableValueArray } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { useFilasDisponibles } from '@/compartido/ganchos/useFilasDisponibles';

interface Propiedades<T> {
  datos: T[];
  clave: keyof T & string;
  /** Texto del total, en plural: "trabajadores", "documentos"… */
  nombrePlural: string;
  vacio: string;
  alAbrir?: (fila: T) => void;
  claseFila?: (fila: T) => string;
  alLimpiarFiltros?: () => void;
  children: ReactNode;
}

/**
 * Tabla común de los listados: filas clicables, tantas filas como quepan en pantalla
 * y paginación simple abajo. Las columnas se pasan como hijos (<Column />).
 */
export function TablaListado<T extends object>({
  datos,
  clave,
  nombrePlural,
  vacio,
  alAbrir,
  claseFila,
  alLimpiarFiltros,
  children,
}: Propiedades<T>) {
  const { ref, filas } = useFilasDisponibles();
  const [primera, setPrimera] = useState(0);
  useEffect(() => setPrimera(0), [datos.length, filas]);

  const total = datos.length;
  const pagina = Math.floor(primera / filas) + 1;
  const totalPaginas = Math.max(1, Math.ceil(total / filas));

  return (
    <div className="pp-tarjeta-tabla" ref={ref}>
      <DataTable responsiveLayout="stack" breakpoint="900px"
        value={datos as DataTableValueArray}
        dataKey={clave}
        onRowClick={alAbrir ? (e) => alAbrir(e.data as T) : undefined}
        rowClassName={(f: T) => `${alAbrir ? 'pp-fila' : ''} ${claseFila?.(f) ?? ''}`}
        first={primera}
        rows={filas}
        paginator
        paginatorClassName="pp-paginador-oculto"
        onPage={(e) => setPrimera(e.first)}
        emptyMessage={
          <div className="pp-vacio">
            <i className="pi pi-inbox" aria-hidden="true" />
            <p>{vacio}</p>
            {alLimpiarFiltros && <Button label="Limpiar filtros" text size="small" onClick={alLimpiarFiltros} />}
          </div>
        }
        className="pp-tabla"
      >
        {children}
      </DataTable>

      {total > 0 && (
        <footer className="pp-paginacion">
          <span>
            {primera + 1}–{Math.min(primera + filas, total)} de {total} {nombrePlural}
          </span>
          <div>
            <Button icon="pi pi-angle-left" text rounded aria-label="Anterior" disabled={pagina === 1} onClick={() => setPrimera(primera - filas)} />
            <span>
              Página {pagina} de {totalPaginas}
            </span>
            <Button icon="pi pi-angle-right" text rounded aria-label="Siguiente" disabled={pagina === totalPaginas} onClick={() => setPrimera(primera + filas)} />
          </div>
        </footer>
      )}
    </div>
  );
}

/** Celda de persona: iniciales, nombre y una línea secundaria. */
export function CeldaPersona({ nombre, detalle }: { nombre: string; detalle: string }) {
  const [apellidos, nombres = ''] = nombre.split(',');
  return (
    <div className="pp-trabajador">
      <span className="pp-avatar" aria-hidden="true">
        {`${nombres.trim()[0] ?? ''}${apellidos.trim()[0] ?? ''}`}
      </span>
      <div>
        <strong>{nombre}</strong>
        <small>{detalle}</small>
      </div>
    </div>
  );
}
