import { FiltroFechas, SIN_RANGO, enRango, type RangoFechas } from '@/compartido/componentes/FiltroFechas';
import { ordenarPorTrabajador } from '@/compartido/formato/orden';
import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { esGestor } from '@/compartido/sesion/tipos';
import { TablaListado, CeldaPersona } from '@/compartido/componentes/TablaListado';
import { Insignia } from '@/compartido/componentes/Insignia';
import { VentanaMotivo } from '@/compartido/componentes/VentanaMotivo';
import { fechaCorta } from '@/compartido/almacen/crearAlmacen';
import '@/compartido/estilos/listados';
import { buscarTrabajador, useTrabajadores } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { AREAS } from '@/modulos/trabajadores/infraestructura/datosTrabajadores';
import type { Trabajador } from '@/modulos/trabajadores/dominio/trabajador';
import { crearDocumento, firmarDocumento, observarDocumento, useDocumentos } from '../aplicacion/almacenDocumentos';
import {
  ESTADOS_DOCUMENTO,
  TIPOS_DOCUMENTO,
  habilitadoParaTrabajador,
  infoEstado,
  resumirExpediente,
  type Documento,
  type EstadoDocumento,
  type ResumenExpediente,
  type TipoDocumento,
} from '../dominio/documento';
import { VentanaDocumento, tituloDocumento } from '../componentes/VentanaDocumento';
import { VentanaNuevoDocumento } from '../componentes/VentanaNuevoDocumento';
import { ExpedienteTrabajador } from '../componentes/ExpedienteTrabajador';
import '../componentes/expediente.css';

/** Misma ruta, distinta pantalla según el rol. */
export function PaginaDocumentos() {
  const usuario = useUsuarioActual();
  const [params] = useSearchParams();
  // Enlaces antiguos "/documentos?dni=…" abren el expediente directamente.
  const dni = params.get('dni');
  if (dni && esGestor(usuario)) return <Navigate to={`/documentos/expediente/${dni}`} replace />;
  return esGestor(usuario) ? <DocumentosRrhh /> : <MiExpediente />;
}

const fechaDe = (d: Documento) => d.historial[d.historial.length - 1].fecha;

type Vista = 'expedientes' | 'documentos';
type Situacion = 'faltantes' | 'pendientes' | 'completos';

const SITUACIONES: { valor: Situacion; etiqueta: string }[] = [
  { valor: 'faltantes', etiqueta: 'Con requeridos faltantes' },
  { valor: 'pendientes', etiqueta: 'Con firmas pendientes' },
  { valor: 'completos', etiqueta: 'Requeridos completos' },
];

interface FilaExpediente {
  trabajador: Trabajador;
  resumen: ResumenExpediente;
}

const cumpleSituacion = ({ resumen }: FilaExpediente, s: Situacion | null) =>
  !s ||
  (s === 'faltantes' && resumen.requeridosCompletos < resumen.requeridosTotal) ||
  (s === 'pendientes' && resumen.pendientesFirma + resumen.observados > 0) ||
  (s === 'completos' && resumen.requeridosCompletos === resumen.requeridosTotal);

/** RR. HH. (CUS40–CUS44, CUS50): expedientes por trabajador y, aparte, todos los documentos. */
function DocumentosRrhh() {
  const usuario = useUsuarioActual();
  const navegar = useNavigate();
  const documentos = useDocumentos();
  const trabajadores = useTrabajadores();
  const aviso = useRef<Toast>(null);
  const [vista, setVista] = useState<Vista>('expedientes');
  const [busqueda, setBusqueda] = useState('');
  const [area, setArea] = useState<string | null>(null);
  const [situacion, setSituacion] = useState<Situacion | null>(null);
  const [fechas, setFechas] = useState<RangoFechas>(SIN_RANGO);
  const [tipo, setTipo] = useState<TipoDocumento | null>(null);
  const [estado, setEstado] = useState<EstadoDocumento | null>(null);
  const [nuevo, setNuevo] = useState(false);

  const q = busqueda.trim().toLowerCase();

  const expedientes = useMemo<FilaExpediente[]>(() => {
    const filas = trabajadores
      .filter((t) => (!area || t.area === area) && (!q || `${t.nombre} ${t.dni}`.toLowerCase().includes(q)))
      .map((t) => ({ trabajador: t, resumen: resumirExpediente(documentos.filter((d) => d.dni === t.dni)) }))
      .filter((f) => cumpleSituacion(f, situacion))
      .filter((f) => fechas === SIN_RANGO || (f.resumen.ultimaActualizacion !== null && enRango(f.resumen.ultimaActualizacion, fechas)));
    return ordenarPorTrabajador(filas, (f) => f.trabajador.nombre, (f) => Number(f.trabajador.dni));
  }, [trabajadores, documentos, area, q, situacion, fechas]);

  const visibles = useMemo(() => {
    const filtrados = documentos.filter(
      (d) =>
        (!area || buscarTrabajador(d.dni)?.area === area) &&
        (!tipo || d.tipo === tipo) &&
        enRango(fechaDe(d), fechas) &&
        (!estado || d.estado === estado) &&
        (!q || `${d.numero} ${d.trabajador} ${d.dni}`.toLowerCase().includes(q)),
    );
    return ordenarPorTrabajador(filtrados, (d) => d.trabajador, (d) => d.numero);
  }, [documentos, q, area, tipo, estado, fechas]);

  const abrirExpediente = (dni: string) => navegar(`/documentos/expediente/${dni}`);
  const limpiar = () => {
    setBusqueda('');
    setArea(null);
    setSituacion(null);
    setTipo(null);
    setEstado(null);
    setFechas(SIN_RANGO);
  };

  const celdaRequeridos = ({ resumen }: FilaExpediente) => (
    <div className="dm-requeridos">
      <span>
        {resumen.requeridosCompletos}/{resumen.requeridosTotal}
      </span>
      <div className="expediente__barra">
        <span style={{ width: `${(resumen.requeridosCompletos / resumen.requeridosTotal) * 100}%` }} />
      </div>
    </div>
  );

  const celdaPendientes = ({ resumen }: FilaExpediente) => (
    <div className="dm-pendientes">
      {resumen.pendientesFirma > 0 && <Insignia tono="ambar">{resumen.pendientesFirma} por firmar</Insignia>}
      {resumen.observados > 0 && <Insignia tono="azul">{resumen.observados} observado{resumen.observados > 1 ? 's' : ''}</Insignia>}
      {resumen.pendientesFirma + resumen.observados === 0 && <span className="tr-col-gris">—</span>}
    </div>
  );

  return (
    <div className="pagina-papeletas">
      <Toast ref={aviso} position="bottom-right" />
      <header className="pp-encabezado">
        <div>
          <h1>Expedientes digitales</h1>
          <p className="dm-subtitulo">Documentos laborales de cada trabajador, sus estados e historial.</p>
        </div>
        <div className="pp-encabezado__acciones">
          <Button label="Nuevo documento" icon="pi pi-plus" className="pp-boton-principal" onClick={() => setNuevo(true)} />
        </div>
      </header>

      <div className="dm-pestanas" role="tablist" aria-label="Vista">
        {(
          [
            ['expedientes', 'Por trabajador', trabajadores.length],
            ['documentos', 'Todos los documentos', documentos.length],
          ] as const
        ).map(([valor, etiqueta, cantidad]) => (
          <button key={valor} type="button" role="tab" aria-selected={vista === valor} onClick={() => setVista(valor)}>
            {etiqueta} <span>{cantidad}</span>
          </button>
        ))}
      </div>

      <div className="pp-filtros__fila">
        <IconField iconPosition="left" className="pp-filtros__busqueda">
          <InputIcon className="pi pi-search" />
          <InputText
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={vista === 'expedientes' ? 'Buscar por nombre o DNI' : 'Buscar por N°, nombre o DNI'}
            aria-label="Buscar"
          />
        </IconField>
        <Dropdown value={area} options={AREAS} onChange={(e) => setArea(e.value ?? null)} placeholder="Todas las áreas" filter showClear className="pp-filtros__area" />
        {vista === 'expedientes' ? (
          <Dropdown value={situacion} options={SITUACIONES} optionLabel="etiqueta" optionValue="valor" onChange={(e) => setSituacion(e.value ?? null)} placeholder="Todas las situaciones" showClear className="pp-filtros__area" />
        ) : (
          <>
            <Dropdown value={tipo} options={TIPOS_DOCUMENTO} optionLabel="etiqueta" optionValue="valor" onChange={(e) => setTipo(e.value ?? null)} placeholder="Todos los tipos" showClear className="pp-filtros__area" />
            <Dropdown value={estado} options={ESTADOS_DOCUMENTO} optionLabel="etiqueta" optionValue="valor" onChange={(e) => setEstado(e.value ?? null)} placeholder="Todos los estados" showClear className="dm-filtro-estado" />
          </>
        )}
        <FiltroFechas valor={fechas} alCambiar={setFechas} etiqueta={vista === 'expedientes' ? 'Actualizado: desde – hasta' : 'Desde – Hasta'} />
      </div>

      {vista === 'expedientes' ? (
        <TablaListado
          datos={expedientes.map((f) => ({ ...f, dni: f.trabajador.dni }))}
          clave="dni"
          nombrePlural="expedientes"
          vacio="No hay expedientes con estos filtros."
          alAbrir={(f) => abrirExpediente(f.dni)}
          alLimpiarFiltros={limpiar}
        >
          <Column header="Trabajador" body={(f: FilaExpediente) => <CeldaPersona nombre={f.trabajador.nombre} detalle={`DNI ${f.trabajador.dni} · ${f.trabajador.cargo}`} />} />
          <Column header="Área" body={(f: FilaExpediente) => f.trabajador.area} className="col-area tr-col-gris" headerClassName="col-area" />
          <Column header="Requeridos firmados" body={celdaRequeridos} />
          <Column header="Pendientes" body={celdaPendientes} />
          <Column header="Documentos" body={(f: FilaExpediente) => f.resumen.total} className="tr-col-gris" />
          <Column header="Actualizado" body={(f: FilaExpediente) => (f.resumen.ultimaActualizacion ? fechaCorta(f.resumen.ultimaActualizacion) : '—')} className="tr-col-gris" />
          <Column body={() => <i className="pi pi-angle-right tr-col-gris" aria-hidden="true" />} className="dm-col-flecha" />
        </TablaListado>
      ) : (
        <TablaListado
          datos={visibles}
          clave="id"
          nombrePlural="documentos"
          vacio="No hay documentos con estos filtros."
          alAbrir={(d) => abrirExpediente(d.dni)}
          claseFila={(d) => `dm-fila es-${d.estado === 'observado' ? 'pendiente_revision' : d.estado}`}
          alLimpiarFiltros={limpiar}
        >
          <Column header="N°" body={(d: Documento) => <strong>{d.numero}</strong>} className="pp-col-fecha" />
          <Column header="Trabajador" body={(d: Documento) => <CeldaPersona nombre={d.trabajador} detalle={`DNI ${d.dni}`} />} />
          <Column header="Área" body={(d: Documento) => buscarTrabajador(d.dni)?.area ?? '—'} className="col-area" headerClassName="col-area" />
          <Column header="Documento" body={tituloDocumento} />
          <Column header="Fecha" body={(d: Documento) => fechaCorta(fechaDe(d))} className="tr-col-gris" />
          <Column header="Estado" body={(d: Documento) => <Insignia tono={infoEstado(d.estado).tono}>{infoEstado(d.estado).etiqueta}</Insignia>} className="pp-col-estado" />
        </TablaListado>
      )}

      <VentanaNuevoDocumento
        visible={nuevo}
        alCerrar={() => setNuevo(false)}
        alCrear={(datos, enviar) => {
          const numero = crearDocumento(datos, usuario.nombre, enviar);
          setNuevo(false);
          aviso.current?.show({ severity: 'success', summary: `Documento N° ${numero} ${enviar ? 'enviado para firma' : 'guardado en preparación'}`, life: 3000 });
        }}
      />
    </div>
  );
}

/** Trabajador (CUS45, CUS46, CUS48): su expediente con los documentos habilitados; los firma u observa. */
function MiExpediente() {
  const usuario = useUsuarioActual();
  const documentos = useDocumentos();
  const ficha = buscarTrabajador(usuario.dni);
  const aviso = useRef<Toast>(null);
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [observando, setObservando] = useState<Documento | null>(null);

  const mios = documentos.filter((d) => d.dni === usuario.dni && habilitadoParaTrabajador(d));
  const porFirmar = mios.filter((d) => d.estado === 'pendiente_firma');
  const detalle = mios.find((d) => d.id === idDetalle) ?? null;

  return (
    <div className="pagina-papeletas">
      <Toast ref={aviso} position="bottom-right" />
      <header className="pp-encabezado">
        <h1>Documentos laborales</h1>
      </header>

      {porFirmar.length > 0 && (
        <button type="button" className="dm-pendiente-trabajador" onClick={() => setIdDetalle(porFirmar[0].id)}>
          <i className="pi pi-pencil" aria-hidden="true" />
          <span>
            Tienes {porFirmar.length} {porFirmar.length === 1 ? 'documento' : 'documentos'} por firmar.
          </span>
          <i className="pi pi-angle-right" aria-hidden="true" />
        </button>
      )}

      <ExpedienteTrabajador
        ficha={ficha ?? { nombre: usuario.nombre, dni: usuario.dni ?? '—', cargo: usuario.cargo, area: '—' }}
        documentos={mios}
        modo="trabajador"
        alAbrir={(d) => setIdDetalle(d.id)}
      />

      <VentanaDocumento
        documento={observando ? null : detalle}
        modo="trabajador"
        alCerrar={() => setIdDetalle(null)}
        alFirmar={(d, imagen) => {
          firmarDocumento(d, usuario.nombre, imagen);
          aviso.current?.show({ severity: 'success', summary: 'Documento firmado', life: 2500 });
        }}
        alObservar={(d) => setObservando(d)}
      />

      <VentanaMotivo
        visible={!!observando}
        titulo="Observar documento"
        etiqueta="¿Qué está mal? *"
        ayuda="RR. HH. corregirá el documento y te lo enviará de nuevo."
        boton="Enviar observación"
        sugerencias={['Mi nombre está mal escrito', 'El cargo no es el correcto', 'Las fechas no coinciden']}
        alCerrar={() => setObservando(null)}
        alConfirmar={(texto) => {
          if (observando) observarDocumento(observando, texto, usuario.nombre);
          setObservando(null);
          aviso.current?.show({ severity: 'info', summary: 'Observación enviada a RR. HH.', life: 2500 });
        }}
      />
    </div>
  );
}
