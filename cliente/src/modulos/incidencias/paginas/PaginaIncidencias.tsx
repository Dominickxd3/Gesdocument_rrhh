import { FiltroFechas, SIN_RANGO, enRango, type RangoFechas } from '@/compartido/componentes/FiltroFechas';
import { ordenarPorTrabajador } from '@/compartido/formato/orden';
import { useMemo, useRef, useState } from 'react';
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
import { buscarTrabajador } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { AREAS } from '@/modulos/trabajadores/infraestructura/datosTrabajadores';
import {
  cerrarSinMemorandum,
  emitirMemorandum,
  firmarRecepcion,
  registrarActuacion,
  registrarIncidencia,
  useIncidencias,
} from '../aplicacion/almacenIncidencias';
import { ESTADOS_INCIDENCIA, infoEstado, visibleParaTrabajador, type EstadoIncidencia, type Incidencia } from '../dominio/incidencia';
import { VentanaEmitirMemorandum, VentanaIncidencia, VentanaRegistroIncidencia } from '../componentes/Ventanas';

/** Misma ruta, distinta pantalla según el rol. */
export function PaginaIncidencias() {
  const usuario = useUsuarioActual();
  return esGestor(usuario) ? <IncidenciasRrhh /> : <MisMemorandums />;
}

const estadoCelda = (i: Incidencia) => <Insignia tono={infoEstado(i.estado).tono}>{infoEstado(i.estado).etiqueta}</Insignia>;

/** RR. HH. (CUS29–CUS35, CUS38, CUS39). */
function IncidenciasRrhh() {
  const usuario = useUsuarioActual();
  const incidencias = useIncidencias();
  const aviso = useRef<Toast>(null);
  const [busqueda, setBusqueda] = useState('');
  const [area, setArea] = useState<string | null>(null);
  const [fechas, setFechas] = useState<RangoFechas>(SIN_RANGO);
  const [estado, setEstado] = useState<EstadoIncidencia | null>(null);
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState(false);
  const [dialogo, setDialogo] = useState<'actuacion' | 'cerrar' | 'emitir' | null>(null);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const filtradas = incidencias.filter(
      (i) => (!area || buscarTrabajador(i.dni)?.area === area) && (!estado || i.estado === estado) && enRango(i.fecha, fechas) && (!q || `${i.numero} ${i.trabajador} ${i.dni} ${i.asunto}`.toLowerCase().includes(q)),
    );
    return ordenarPorTrabajador(filtradas, (i) => i.trabajador, (i) => i.numero);
  }, [incidencias, busqueda, area, estado, fechas]);

  const detalle = incidencias.find((i) => i.id === idDetalle) ?? null;
  const avisar = (summary: string, detail?: string) => aviso.current?.show({ severity: 'success', summary, detail, life: 3000 });

  return (
    <div className="pagina-papeletas">
      <Toast ref={aviso} position="bottom-right" />
      <header className="pp-encabezado">
        <h1>Incidencias y memorándums</h1>
        <div className="pp-encabezado__acciones">
          <Button label="Registrar incidencia" icon="pi pi-plus" className="pp-boton-principal" onClick={() => setRegistrando(true)} />
        </div>
      </header>

      <div className="pp-filtros__fila">
        <IconField iconPosition="left" className="pp-filtros__busqueda">
          <InputIcon className="pi pi-search" />
          <InputText value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por N°, trabajador o asunto" aria-label="Buscar" />
        </IconField>
        <Dropdown value={area} options={AREAS} onChange={(e) => setArea(e.value ?? null)} placeholder="Todas las áreas" filter showClear className="pp-filtros__area" />
        <Dropdown value={estado} options={ESTADOS_INCIDENCIA} optionLabel="etiqueta" optionValue="valor" onChange={(e) => setEstado(e.value ?? null)} placeholder="Todos los estados" showClear className="dm-filtro-estado" />
        <FiltroFechas valor={fechas} alCambiar={setFechas} />
      </div>

      <TablaListado
        datos={visibles}
        clave="id"
        nombrePlural="incidencias"
        vacio="No hay incidencias con estos filtros."
        alAbrir={(i) => setIdDetalle(i.id)}
        claseFila={(i) => `dm-fila es-${i.estado === 'registrada' ? 'pendiente_revision' : i.estado}`}
        alLimpiarFiltros={() => {
          setBusqueda('');
          setArea(null);
          setEstado(null);
          setFechas(SIN_RANGO);
        }}
      >
        <Column header="N°" body={(i: Incidencia) => <strong>{i.numero}</strong>} className="pp-col-fecha" />
        <Column header="Trabajador" body={(i: Incidencia) => <CeldaPersona nombre={i.trabajador} detalle={`DNI ${i.dni}`} />} />
        <Column header="Área" body={(i: Incidencia) => buscarTrabajador(i.dni)?.area ?? '—'} className="col-area" headerClassName="col-area" />
        <Column header="Asunto" field="asunto" />
        <Column header="Fecha" body={(i: Incidencia) => fechaCorta(i.fecha)} className="tr-col-gris" />
        <Column header="Estado" body={estadoCelda} className="pp-col-estado" />
      </TablaListado>

      <VentanaIncidencia
        incidencia={dialogo ? null : detalle}
        modo="rrhh"
        alCerrar={() => setIdDetalle(null)}
        alActuacion={() => setDialogo('actuacion')}
        alCerrarSinMemo={() => setDialogo('cerrar')}
        alEmitir={() => setDialogo('emitir')}
      />

      <VentanaMotivo
        visible={dialogo === 'actuacion'}
        titulo="Registrar actuación"
        etiqueta="Explicación del trabajador o actuación realizada *"
        ayuda="Queda en el expediente de la incidencia con tu nombre y la fecha."
        boton="Registrar"
        alCerrar={() => setDialogo(null)}
        alConfirmar={(texto) => {
          if (detalle) registrarActuacion(detalle, 'actuacion', texto, usuario.nombre);
          setDialogo(null);
          avisar('Actuación registrada', 'La incidencia está en investigación.');
        }}
      />
      <VentanaMotivo
        visible={dialogo === 'cerrar'}
        titulo="Cerrar sin memorándum"
        etiqueta="Conclusión *"
        boton="Cerrar incidencia"
        sugerencias={['Explicación justificada; se orienta verbalmente.', 'No se confirmaron los hechos.']}
        alCerrar={() => setDialogo(null)}
        alConfirmar={(texto) => {
          if (detalle) cerrarSinMemorandum(detalle, texto, usuario.nombre);
          setDialogo(null);
          avisar('Incidencia cerrada sin memorándum');
        }}
      />
      <VentanaEmitirMemorandum
        incidencia={dialogo === 'emitir' ? detalle : null}
        alCerrar={() => setDialogo(null)}
        alEmitir={(i, medida, texto) => {
          emitirMemorandum(i, medida, texto, usuario.nombre);
          setDialogo(null);
          avisar('Memorándum emitido', 'El trabajador debe firmar la recepción.');
        }}
      />
      <VentanaRegistroIncidencia
        visible={registrando}
        alCerrar={() => setRegistrando(false)}
        alGuardar={(datos) => {
          const numero = registrarIncidencia(datos, usuario.nombre);
          setRegistrando(false);
          avisar(`Incidencia N° ${numero} registrada`);
        }}
      />
    </div>
  );
}

/** Trabajador (CUS36–CUS39): sus memorándums; confirma la recepción y firma. */
function MisMemorandums() {
  const usuario = useUsuarioActual();
  const incidencias = useIncidencias();
  const aviso = useRef<Toast>(null);
  const [idDetalle, setIdDetalle] = useState<string | null>(null);

  const mios = incidencias.filter((i) => i.dni === usuario.dni && visibleParaTrabajador(i));
  const porFirmar = mios.filter((i) => i.estado === 'memo_emitido');
  const detalle = mios.find((i) => i.id === idDetalle) ?? null;

  return (
    <div className="pagina-papeletas">
      <Toast ref={aviso} position="bottom-right" />
      <header className="pp-encabezado">
        <h1>Mis memorándums</h1>
      </header>

      {porFirmar.length > 0 && (
        <button type="button" className="dm-pendiente-trabajador" onClick={() => setIdDetalle(porFirmar[0].id)}>
          <i className="pi pi-inbox" aria-hidden="true" />
          <span>Tienes un memorándum por recibir. Léelo y firma la recepción.</span>
          <i className="pi pi-angle-right" aria-hidden="true" />
        </button>
      )}

      <TablaListado datos={mios} clave="id" nombrePlural="memorándums" vacio="No tienes memorándums." alAbrir={(i) => setIdDetalle(i.id)}>
        <Column header="Asunto" field="asunto" />
        <Column header="Fecha" body={(i: Incidencia) => fechaCorta(i.memorandum?.emitido ?? i.fecha)} className="tr-col-gris" />
        <Column header="Estado" body={estadoCelda} />
      </TablaListado>

      <VentanaIncidencia
        incidencia={detalle}
        modo="trabajador"
        alCerrar={() => setIdDetalle(null)}
        alFirmar={(i) => {
          firmarRecepcion(i, usuario.nombre);
          aviso.current?.show({ severity: 'success', summary: 'Recepción firmada', life: 2500 });
        }}
      />
    </div>
  );
}
