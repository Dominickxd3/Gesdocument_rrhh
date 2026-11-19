import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { TablaListado, CeldaPersona } from '@/compartido/componentes/TablaListado';
import { fechaLarga, momento } from '@/compartido/almacen/crearAlmacen';
import '@/compartido/estilos/listados';
import { almacenTrabajadores, editarTrabajador, sincronizarConErp, useTrabajadores } from '../aplicacion/almacenTrabajadores';
import { AREAS, JEFES } from '../infraestructura/datosTrabajadores';
import { nombreLegible, type Trabajador } from '../dominio/trabajador';

/** Trabajadores (RF01, RF02, RF03): lista sincronizada con el ERP, ficha y edición de contacto y jefatura. */
export function PaginaTrabajadores() {
  const trabajadores = useTrabajadores();
  const { sincronizado } = almacenTrabajadores.usar();
  const aviso = useRef<Toast>(null);
  const [busqueda, setBusqueda] = useState('');
  const [area, setArea] = useState<string | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [verDni, setVerDni] = useState<string | null>(null);
  const [editarDni, setEditarDni] = useState<string | null>(null);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return trabajadores.filter(
      (t) => (!area || t.area === area) && (!q || `${t.nombre} ${t.dni}`.toLowerCase().includes(q)),
    );
  }, [trabajadores, busqueda, area]);

  const sincronizar = async () => {
    setSincronizando(true);
    const total = await sincronizarConErp();
    setSincronizando(false);
    aviso.current?.show({ severity: 'success', summary: 'Sincronizado con el ERP', detail: `${total} trabajadores activos.`, life: 3000 });
  };

  const accion = (icono: string, etiqueta: string, alPresionar: () => void) => (
    <Button
      icon={icono}
      text
      rounded
      className="pp-boton-abrir"
      aria-label={etiqueta}
      tooltip={etiqueta}
      tooltipOptions={{ position: 'top' }}
      onClick={(e) => {
        e.stopPropagation();
        alPresionar();
      }}
    />
  );

  return (
    <div className="pagina-papeletas">
      <Toast ref={aviso} position="bottom-right" />

      <header className="pp-encabezado">
        <div>
          <h1>Trabajadores</h1>
          <p className="tr-sincronizado">Última sincronización con el ERP: {momento(sincronizado)}</p>
        </div>
        <div className="pp-encabezado__acciones">
          <Button label="Sincronizar con el ERP" icon="pi pi-sync" className="pp-boton-principal" loading={sincronizando} onClick={() => void sincronizar()} />
        </div>
      </header>

      <div className="pp-filtros__fila">
        <IconField iconPosition="left" className="pp-filtros__busqueda">
          <InputIcon className="pi pi-search" />
          <InputText value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o DNI" aria-label="Buscar" />
        </IconField>
        <Dropdown value={area} options={AREAS} onChange={(e) => setArea(e.value ?? null)} placeholder="Todas las áreas" aria-label="Área" filter showClear className="pp-filtros__area" />
      </div>

      <TablaListado
        datos={visibles}
        clave="dni"
        nombrePlural="trabajadores"
        vacio="No hay trabajadores con estos filtros."
        alAbrir={(t) => setVerDni(t.dni)}
        alLimpiarFiltros={() => {
          setBusqueda('');
          setArea(null);
        }}
      >
        <Column header="DNI" field="dni" className="tr-col-dni" />
        <Column header="Nombre completo" body={(t: Trabajador) => <CeldaPersona nombre={t.nombre} detalle={t.cargo} />} />
        <Column header="Área" field="area" className="tr-col-gris" />
        <Column header="Correo" field="correo" className="tr-col-gris tr-col-correo" headerClassName="tr-col-correo" />
        <Column header="Teléfono" field="telefono" className="tr-col-telefono" />
        <Column
          header="Acciones"
          body={(t: Trabajador) => (
            <div className="pp-acciones">
              {accion('pi pi-eye', 'Ver ficha', () => setVerDni(t.dni))}
              {accion('pi pi-pencil', 'Editar', () => setEditarDni(t.dni))}
            </div>
          )}
          className="pp-col-acciones"
        />
      </TablaListado>

      <VentanaFicha
        trabajador={trabajadores.find((t) => t.dni === verDni) ?? null}
        alCerrar={() => setVerDni(null)}
        alEditar={(dni) => {
          setVerDni(null);
          setEditarDni(dni);
        }}
      />
      <VentanaEditar
        trabajador={trabajadores.find((t) => t.dni === editarDni) ?? null}
        alCerrar={() => setEditarDni(null)}
        alGuardar={(dni, cambios) => {
          editarTrabajador(dni, cambios);
          setEditarDni(null);
          aviso.current?.show({ severity: 'success', summary: 'Datos actualizados', life: 2500 });
        }}
      />
    </div>
  );
}

/** Ficha (RF03): datos del ERP, jefatura con su historial y acceso a su expediente de documentos. */
function VentanaFicha({ trabajador: t, alCerrar, alEditar }: { trabajador: Trabajador | null; alCerrar: () => void; alEditar: (dni: string) => void }) {
  const navegar = useNavigate();
  return (
    <Dialog visible={!!t} onHide={alCerrar} showHeader={false} modal dismissableMask draggable={false} className="pp-panel" style={{ width: '520px' }} breakpoints={{ '640px': '94vw' }}>
      {t && (
        <div className="pp-panel__contenido">
          <header className="pp-panel__encabezado">
            <div>
              <span className="pp-panel__kicker">Ficha del trabajador</span>
              <h2 className="tr-nombre">{nombreLegible(t.nombre)}</h2>
            </div>
            <Button icon="pi pi-times" text rounded aria-label="Cerrar" className="pp-panel__cerrar" onClick={alCerrar} />
          </header>
          <dl className="pp-panel__datos">
            <div><dt>DNI</dt><dd>{t.dni}</dd></div>
            <div><dt>Fecha de ingreso</dt><dd>{fechaLarga(t.fechaIngreso)}</dd></div>
            <div><dt>Área</dt><dd>{t.area}</dd></div>
            <div><dt>Cargo</dt><dd>{t.cargo}</dd></div>
            <div><dt>Sede</dt><dd>{t.sede}</dd></div>
            <div><dt>Teléfono</dt><dd>{t.telefono}</dd></div>
            <div className="ancho-completo"><dt>Correo</dt><dd>{t.correo}</dd></div>
            <div className="ancho-completo"><dt>Jefe inmediato</dt><dd>{t.jefe}</dd></div>
          </dl>
          <section>
            <h3 className="pp-panel__subtitulo">Historial de jefaturas</h3>
            <ol className="pp-linea-tiempo">
              {[...t.historialJefes].reverse().map((h) => (
                <li key={h.desde}>
                  <span className="pp-linea-tiempo__punto"><i className="pi pi-user" aria-hidden="true" /></span>
                  <div>
                    <strong>{h.jefe}</strong>
                    <small>Desde {fechaLarga(h.desde)}</small>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <footer className="pp-panel__pie">
            <div className="pp-panel__decision">
              <Button label="Ver expediente" icon="pi pi-folder-open" outlined className="pp-boton-secundario" onClick={() => navegar(`/documentos?dni=${t.dni}`)} />
              <Button label="Editar" icon="pi pi-pencil" className="pp-boton-principal" onClick={() => alEditar(t.dni)} />
            </div>
          </footer>
        </div>
      )}
    </Dialog>
  );
}

/** Edición: solo lo que no viene del ERP (contacto) y la jefatura (RF02). */
function VentanaEditar({
  trabajador: t,
  alCerrar,
  alGuardar,
}: {
  trabajador: Trabajador | null;
  alCerrar: () => void;
  alGuardar: (dni: string, cambios: Pick<Trabajador, 'correo' | 'telefono' | 'jefe'>) => void;
}) {
  const [datos, setDatos] = useState({ correo: '', telefono: '', jefe: '' });
  const [actual, setActual] = useState<string | null>(null);
  if (t && actual !== t.dni) {
    setActual(t.dni);
    setDatos({ correo: t.correo, telefono: t.telefono, jefe: t.jefe });
  }

  return (
    <Dialog
      visible={!!t}
      onHide={() => {
        setActual(null);
        alCerrar();
      }}
      header={t ? `Editar · ${nombreLegible(t.nombre)}` : ''}
      className="pp-ventana"
      style={{ width: '480px' }}
      breakpoints={{ '640px': '94vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Cancelar" text onClick={alCerrar} />
          <Button label="Guardar" icon="pi pi-check" className="pp-boton-principal" onClick={() => t && alGuardar(t.dni, datos)} />
        </div>
      }
    >
      <div className="pp-formulario">
        <p className="tr-nota">Nombre, DNI, área y cargo vienen del ERP y se actualizan al sincronizar.</p>
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Correo</span>
          <InputText value={datos.correo} onChange={(e) => setDatos({ ...datos, correo: e.target.value })} />
        </label>
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Teléfono</span>
          <InputText value={datos.telefono} onChange={(e) => setDatos({ ...datos, telefono: e.target.value })} />
        </label>
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Jefe inmediato</span>
          <Dropdown value={datos.jefe} options={JEFES} onChange={(e) => setDatos({ ...datos, jefe: e.value })} />
          <small className="pp-campo__ayuda">Si cambia, el anterior queda en el historial de jefaturas.</small>
        </label>
      </div>
    </Dialog>
  );
}
