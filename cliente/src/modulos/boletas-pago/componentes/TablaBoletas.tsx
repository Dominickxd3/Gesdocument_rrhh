import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import type { Boleta } from '../dominio/boleta';
import { InsigniaEnvio, InsigniaEstado } from './EstadoBoleta';

interface PropiedadesTablaBoletas {
  boletas: Boleta[];
  cargando: boolean;
  seleccion: Boleta[];
  alSeleccionar: (seleccion: Boleta[]) => void;
  alAbrir: (boleta: Boleta) => void;
  alEnviar: (boleta: Boleta) => void;
  alCopiarEnlace: (boleta: Boleta) => void;
  alRevertirFirma: (boleta: Boleta) => void;
  alLimpiarFiltros: () => void;
}

const FILAS_POR_PAGINA = 15;

interface PropiedadesBotonAccion {
  icono: string;
  etiqueta: string;
  alPresionar: () => void;
}

function BotonAccion({ icono, etiqueta, alPresionar }: PropiedadesBotonAccion) {
  return (
    <Button
      icon={icono}
      rounded
      text
      className="boton-accion"
      aria-label={etiqueta}
      tooltip={etiqueta}
      tooltipOptions={{ position: 'top', showDelay: 300 }}
      onClick={(e) => {
        e.stopPropagation();
        alPresionar();
      }}
    />
  );
}

export function TablaBoletas({
  boletas,
  cargando,
  seleccion,
  alSeleccionar,
  alAbrir,
  alEnviar,
  alCopiarEnlace,
  alRevertirFirma,
  alLimpiarFiltros,
}: PropiedadesTablaBoletas) {
  const [primera, setPrimera] = useState(0);

  // Al cambiar filtros o periodo se vuelve a la primera página.
  useEffect(() => setPrimera(0), [boletas.length]);

  const total = boletas.length;
  const pagina = Math.floor(primera / FILAS_POR_PAGINA) + 1;
  const totalPaginas = Math.max(1, Math.ceil(total / FILAS_POR_PAGINA));
  const ultima = Math.min(primera + FILAS_POR_PAGINA, total);

  // Igual que la web de boletas: las firmadas se pueden revertir; las pendientes, enviar o compartir.
  const plantillaAcciones = (boleta: Boleta) => {
    if (boleta.firma === 'firmada') {
      return (
        <div className="acciones-fila">
          <BotonAccion icono="pi pi-eye" etiqueta="Ver boleta" alPresionar={() => alAbrir(boleta)} />
          <BotonAccion icono="pi pi-replay" etiqueta="Revertir firma" alPresionar={() => alRevertirFirma(boleta)} />
        </div>
      );
    }
    const enviado = boleta.estadoEnvio === 'enviado';
    return (
      <div className="acciones-fila">
        <BotonAccion icono="pi pi-eye" etiqueta="Ver boleta" alPresionar={() => alAbrir(boleta)} />
        <BotonAccion icono="pi pi-link" etiqueta="Copiar enlace de la boleta" alPresionar={() => alCopiarEnlace(boleta)} />
        <BotonAccion
          icono="pi pi-send"
          etiqueta={enviado ? 'Reenviar al colaborador' : 'Enviar al colaborador'}
          alPresionar={() => alEnviar(boleta)}
        />
      </div>
    );
  };

  const mensajeVacio = (
    <div className="tabla-vacia">
      <i className="pi pi-inbox" aria-hidden="true" />
      <p>No hay boletas que coincidan con los filtros.</p>
      <Button label="Limpiar filtros" text size="small" onClick={alLimpiarFiltros} />
    </div>
  );

  return (
    <div className="tarjeta-tabla">
      <DataTable
        value={boletas}
        dataKey="id"
        loading={cargando}
        selectionMode="checkbox"
        selection={seleccion}
        onSelectionChange={(e) => alSeleccionar(e.value as Boleta[])}
        onRowClick={(e) => alAbrir(e.data as Boleta)}
        rowClassName={() => 'fila-boleta'}
        first={primera}
        rows={FILAS_POR_PAGINA}
        paginator
        paginatorClassName="paginador-oculto"
        onPage={(e) => setPrimera(e.first)}
        sortField="trabajador"
        sortOrder={1}
        emptyMessage={mensajeVacio}
        className="tabla-boletas"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3.25rem' }} />
        <Column field="dni" header="DNI" sortable className="columna-dni" />
        <Column field="trabajador" header="Trabajador" sortable className="columna-trabajador" />
        <Column field="area" header="Área" sortable className="columna-area" />
        <Column header="Estado" body={(b: Boleta) => <InsigniaEstado boleta={b} />} className="columna-estado" />
        <Column header="Envío" body={(b: Boleta) => <InsigniaEnvio boleta={b} />} className="columna-envio" />
        <Column header="Acciones" body={plantillaAcciones} className="columna-acciones" />
      </DataTable>

      {total > 0 && (
        <footer className="paginacion">
          <span className="paginacion__resumen">
            Mostrando {primera + 1}–{ultima} de {total}
          </span>
          <div className="paginacion__controles">
            <Button
              label="Anterior"
              text
              className="paginacion__boton"
              disabled={pagina === 1}
              onClick={() => setPrimera(primera - FILAS_POR_PAGINA)}
            />
            <span className="paginacion__pagina">
              Página {pagina} de {totalPaginas}
            </span>
            <Button
              label="Siguiente"
              text
              className="paginacion__boton"
              disabled={pagina === totalPaginas}
              onClick={() => setPrimera(primera + FILAS_POR_PAGINA)}
            />
          </div>
        </footer>
      )}
    </div>
  );
}
