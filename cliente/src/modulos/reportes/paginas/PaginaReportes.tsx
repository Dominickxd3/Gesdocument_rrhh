import { useAviso } from '@/compartido/notificaciones/notificaciones';
import { FiltroFechas, SIN_RANGO, enRango, type RangoFechas } from '@/compartido/componentes/FiltroFechas';
import { useMemo, useState } from 'react';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { TablaListado } from '@/compartido/componentes/TablaListado';
import { momento } from '@/compartido/almacen/crearAlmacen';
import '@/compartido/estilos/listados';
import { useDocumentos } from '@/modulos/documentos/aplicacion/almacenDocumentos';
import { etiquetaTipo } from '@/modulos/documentos/dominio/documento';
import { useIncidencias } from '@/modulos/incidencias/aplicacion/almacenIncidencias';
import { TEXTO_ACTUACION } from '@/modulos/incidencias/dominio/incidencia';
import { useListaDescansos } from '@/modulos/descansos-medicos/aplicacion/almacenDescansos';

/** Trazabilidad (RNF04): quién hizo qué, cuándo y sobre qué registro, en todos los módulos. */
interface Evento {
  id: string;
  fecha: string;
  usuario: string;
  accion: string;
  modulo: 'Documentos' | 'Incidencias' | 'Descansos médicos';
  registro: string;
}

const MODULOS: Evento['modulo'][] = ['Documentos', 'Incidencias', 'Descansos médicos'];

const ACCION_DOCUMENTO = { creado: 'Preparó', enviado: 'Envió a firma', observado: 'Observó', corregido: 'Corrigió', firmado: 'Firmó' } as const;
const ACCION_DESCANSO = { aviso: 'Registró aviso', sustento: 'Presentó sustentos', verificado: 'Verificó en portal', observado: 'Observó', aprobado: 'Aprobó', rechazado: 'Rechazó' } as const;

const REPORTES = [
  { titulo: 'Documentos pendientes de firma', detalle: 'Por trabajador y antigüedad', icono: 'pi pi-file-edit' },
  { titulo: 'Memorándums emitidos', detalle: 'Medida, fecha y estado de firma', icono: 'pi pi-exclamation-triangle' },
  { titulo: 'Descansos médicos aprobados', detalle: 'Días reconocidos por periodo', icono: 'pi pi-heart' },
];

export function PaginaReportes() {
  const documentos = useDocumentos();
  const incidencias = useIncidencias();
  const descansos = useListaDescansos();
  const aviso = useAviso();
  const [busqueda, setBusqueda] = useState('');
  const [modulo, setModulo] = useState<Evento['modulo'] | null>(null);
  const [fechas, setFechas] = useState<RangoFechas>(SIN_RANGO);

  const eventos = useMemo<Evento[]>(() => {
    const lista: Evento[] = [
      ...documentos.flatMap((d) =>
        d.historial.map((h, n) => ({ id: `${d.id}-${n}`, fecha: h.fecha, usuario: h.usuario, accion: ACCION_DOCUMENTO[h.accion], modulo: 'Documentos' as const, registro: `N° ${d.numero} · ${etiquetaTipo(d.tipo)} · ${d.trabajador}` })),
      ),
      ...incidencias.flatMap((i) =>
        i.actuaciones.map((a, n) => ({ id: `${i.id}-${n}`, fecha: a.fecha, usuario: a.usuario, accion: TEXTO_ACTUACION[a.tipo].texto.replace(/^\w/, (l) => l.toUpperCase()), modulo: 'Incidencias' as const, registro: `N° ${i.numero} · ${i.asunto}` })),
      ),
      ...descansos.flatMap((d) =>
        d.historial.map((h, n) => ({ id: `${d.id}-${n}`, fecha: h.fecha, usuario: h.usuario, accion: ACCION_DESCANSO[h.accion], modulo: 'Descansos médicos' as const, registro: `N° ${d.numero} · ${d.trabajador.nombre}` })),
      ),
    ];
    return lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [documentos, incidencias, descansos]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return eventos.filter((e) => (!modulo || e.modulo === modulo) && enRango(e.fecha, fechas) && (!q || `${e.usuario} ${e.registro} ${e.accion}`.toLowerCase().includes(q)));
  }, [eventos, busqueda, modulo, fechas]);

  return (
    <div className="pagina-papeletas">
      <header className="pp-encabezado">
        <h1>Reportes</h1>
      </header>

      <div className="rp-accesos">
        {REPORTES.map((r) => (
          <button
            key={r.titulo}
            type="button"
            className="rp-acceso"
            onClick={() => aviso.current?.show({ severity: 'info', summary: 'Exportación simulada', detail: `En producción descargará "${r.titulo}" en Excel.`, life: 3000 })}
          >
            <i className={r.icono} aria-hidden="true" />
            <div>
              <strong>{r.titulo}</strong>
              <small>{r.detalle}</small>
            </div>
            <i className="pi pi-download" aria-hidden="true" />
          </button>
        ))}
      </div>

      <h2 className="pp-panel__subtitulo">Trazabilidad de operaciones</h2>
      <div className="pp-filtros__fila">
        <IconField iconPosition="left" className="pp-filtros__busqueda">
          <InputIcon className="pi pi-search" />
          <InputText value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por usuario, registro o acción" aria-label="Buscar" />
        </IconField>
        <Dropdown value={modulo} options={MODULOS} onChange={(e) => setModulo(e.value ?? null)} placeholder="Todos los módulos" showClear className="pp-filtros__area" />
        <FiltroFechas valor={fechas} alCambiar={setFechas} />
      </div>

      <TablaListado
        datos={visibles}
        clave="id"
        nombrePlural="operaciones"
        vacio="No hay operaciones con estos filtros."
        alLimpiarFiltros={() => {
          setBusqueda('');
          setModulo(null);
          setFechas(SIN_RANGO);
        }}
      >
        <Column header="Fecha" body={(e: Evento) => momento(e.fecha)} className="tr-col-dni" />
        <Column header="Usuario" field="usuario" />
        <Column header="Acción" field="accion" />
        <Column header="Módulo" field="modulo" className="tr-col-gris" />
        <Column header="Registro" field="registro" className="tr-col-gris" />
      </TablaListado>
    </div>
  );
}
