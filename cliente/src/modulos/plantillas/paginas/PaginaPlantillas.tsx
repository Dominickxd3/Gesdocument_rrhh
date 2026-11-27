import { useAviso } from '@/compartido/notificaciones/notificaciones';
import { useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { TablaListado } from '@/compartido/componentes/TablaListado';
import { BotonArchivo } from '@/compartido/componentes/BotonArchivo';
import { ahoraIso, crearAlmacen, fechaCorta, haceDias, momento } from '@/compartido/almacen/crearAlmacen';
import '@/compartido/estilos/listados';
import type { TipoDocumento } from '@/modulos/documentos/dominio/documento';
import { documentoDeMuestra } from '@/modulos/documentos/aplicacion/almacenDocumentos';
import { VistaDocumento } from '@/modulos/documentos/componentes/VistaDocumento';
import { VistaMemorandum } from '@/modulos/incidencias/componentes/Ventanas';
import type { Incidencia } from '@/modulos/incidencias/dominio/incidencia';
import { MODELOS_IMPUTACION, buscarModelo, hechosDeModelo, type IdModelo } from '@/modulos/incidencias/dominio/modelosImputacion';

const esMemo = (f: string): f is `memo:${IdModelo}` => f.startsWith('memo:');

/** Plantillas documentales (RF05, CUS41): Word con campos {{...}} que se llenan con la ficha del trabajador. */
interface Plantilla {
  id: string;
  nombre: string;
  tipo: string;
  campos: string[];
  /** Documento que genera: permite ver el formato con datos de ejemplo. */
  formato?: TipoDocumento | `memo:${IdModelo}`;
  versiones: { version: number; archivo: string; usuario: string; fecha: string }[];
}

const TIPOS = ['Ingreso', 'Contrato', 'Adenda', 'Constancia', 'Cargo de recepción', 'Declaración jurada', 'Memorándum'];

/** Documentos que Gestión Humana entrega a todo trabajador al ingresar (modelos de la empresa). */
const INGRESO: Omit<Plantilla, 'id' | 'versiones'>[] = [
  { nombre: 'Inducción al personal nuevo (GC-RH-F009)', tipo: 'Ingreso', campos: ['{{nombre}}', '{{dni}}', '{{fecha_firma}}'] },
  { nombre: 'Acuerdo de confidencialidad', tipo: 'Ingreso', campos: ['{{nombre}}', '{{dni}}', '{{fecha_firma}}'] },
  { nombre: 'Código de Ética', tipo: 'Ingreso', campos: ['{{nombre}}', '{{dni}}', '{{fecha_firma}}'] },
  { nombre: 'Política de uso de celulares personales', tipo: 'Ingreso', campos: ['{{nombre}}', '{{dni}}', '{{fecha_firma}}'] },
  { nombre: 'Política de vestimenta y aseo', tipo: 'Ingreso', campos: ['{{nombre}}', '{{dni}}', '{{fecha_firma}}'] },
  { nombre: 'DJ de no tener antecedentes policiales (GC-RH-F007)', tipo: 'Ingreso', campos: ['{{nombre}}', '{{dni}}', '{{domicilio}}', '{{fecha_firma}}'] },
  { nombre: 'Croquis de domicilio (GC-RH-F006)', tipo: 'Ingreso', campos: ['{{domicilio}}', '{{fecha_firma}}'] },
];
const ARCHIVOS_INGRESO = ['INDUCCIÓN AL PERSONAL NUEVO.docx', 'ACUERDO DE CONFIDENCIALIDAD GP.docx', 'Código de Ética.docx', 'Politica de Celulares.docx', 'POLITICA DE VESTIMENTA y ASEO GP.docx', 'DECLARACION JURADA DE ANTECEDENTES POLICIALES.docx', 'CROQUIS DE DOMICILIO.docx'];
const FORMATOS_INGRESO: TipoDocumento[] = ['induccion', 'confidencialidad', 'etica', 'celulares', 'vestimenta', 'antecedentes', 'croquis'];
const CAMPOS_BASE = ['{{nombre}}', '{{dni}}', '{{cargo}}', '{{area}}', '{{fecha_ingreso}}'];

const almacenPlantillas = crearAlmacen<Plantilla[]>(() => [
  ...INGRESO.map((p, i) => ({ ...p, id: `pl-ing-${i + 1}`, formato: FORMATOS_INGRESO[i], versiones: [{ version: 1, archivo: ARCHIVOS_INGRESO[i], usuario: 'María Torres', fecha: haceDias(3) }] })),
  { id: 'pl-1', formato: 'contrato', nombre: 'Contrato de trabajo', tipo: 'Contrato', campos: ['{{nombre}}', '{{dni}}', '{{domicilio}}', '{{cargo}}', '{{fecha_inicio}}', '{{fecha_fin}}', '{{remuneracion}}', '{{horario}}', '{{funciones}}'], versiones: [{ version: 1, archivo: 'CONTRATO POR INCREMENTO DE ACTIVIDAD v1.docx', usuario: 'Carlos Ramírez', fecha: haceDias(120) }, { version: 2, archivo: 'CONTRATO POR INCREMENTO DE ACTIVIDAD v2.docx', usuario: 'Carlos Ramírez', fecha: haceDias(30) }] },
  {
    id: 'pl-2',
    formato: 'adenda',
    nombre: 'Adenda al contrato de trabajo (cambio de cargo o remuneración)',
    tipo: 'Adenda',
    campos: ['{{nombre}}', '{{dni}}', '{{domicilio}}', '{{modalidad_contrato}}', '{{fecha_contrato}}', '{{cargo_anterior}}', '{{clausula_remuneracion}}', '{{remuneracion_anterior}}', '{{cargo_nuevo}}', '{{remuneracion_nueva}}', '{{clausulas_especiales}}', '{{fecha_firma}}'],
    versiones: [{ version: 1, archivo: 'ADENDA CONTRATO DE TRABAJO.docx', usuario: 'María Torres', fecha: haceDias(2) }],
  },
  { id: 'pl-3', formato: 'constancia', nombre: 'Constancia de trabajo', tipo: 'Constancia', campos: CAMPOS_BASE, versiones: [{ version: 1, archivo: 'constancia.docx', usuario: 'María Torres', fecha: haceDias(200) }] },
  { id: 'pl-4', formato: 'reglamento', nombre: 'Cargo de Reglamento Interno', tipo: 'Cargo de recepción', campos: ['{{nombre}}', '{{dni}}'], versiones: [{ version: 1, archivo: 'cargo_rit.docx', usuario: 'María Torres', fecha: haceDias(90) }] },
  { id: 'pl-6', formato: 'domicilio', nombre: 'Declaración jurada de domicilio', tipo: 'Declaración jurada', campos: ['{{nombre}}', '{{dni}}', '{{direccion}}'], versiones: [{ version: 1, archivo: 'dj_domicilio.docx', usuario: 'María Torres', fecha: haceDias(300) }] },
  // Memorándums: una plantilla por modelo de carta de imputación de cargos, sin repetir.
  ...MODELOS_IMPUTACION.map((m, i) => ({
    id: `pl-memo-${m.id}`,
    formato: `memo:${m.id}` as const,
    nombre: `Carta de imputación · ${m.nombre}`,
    tipo: 'Memorándum',
    campos: ['{{nombre}}', '{{dni}}', '{{area}}', '{{fecha}}', '{{hechos}}', '{{plazo}}'],
    versiones: [{ version: 1, archivo: 'CARTA DE IMPUTACIÓN DE CARGOS.docx', usuario: 'María Torres', fecha: haceDias(1 + (i % 3)) }],
  })),
]);

const ultima = (p: Plantilla) => p.versiones[p.versiones.length - 1];

/** Carta de imputación de ejemplo para ver el formato de un modelo. */
function memorandumDeMuestra(modelo: IdModelo): Incidencia {
  const hoy = ahoraIso();
  const m = buscarModelo(modelo);
  return {
    id: 'muestra-memorandum',
    numero: 0,
    dni: '00000000',
    trabajador: 'APELLIDOS, NOMBRES',
    fecha: hoy.slice(0, 10),
    asunto: m.nombre,
    descripcion: '',
    reportadoPor: '',
    evidencias: [],
    estado: 'memo_emitido',
    memorandum: { modelo, texto: hechosDeModelo(m, '[fecha de los hechos]'), plazo: m.plazo, emitido: hoy },
    actuaciones: [],
  };
}

export function PaginaPlantillas() {
  const usuario = useUsuarioActual();
  const plantillas = almacenPlantillas.usar();
  const aviso = useAviso();
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [nueva, setNueva] = useState(false);
  const [formato, setFormato] = useState<Plantilla['formato'] | null>(null);
  const detalle = plantillas.find((p) => p.id === idDetalle) ?? null;

  /** Botón "Ver formato": abre el documento tal como lo recibe el trabajador, con datos de ejemplo. */
  const botonFormato = (p: Plantilla, conTexto = false) =>
    p.formato ? (
      <Button
        label={conTexto ? 'Ver formato' : undefined}
        icon="pi pi-eye"
        text={!conTexto}
        rounded={!conTexto}
        outlined={conTexto}
        className={conTexto ? 'pp-boton-secundario' : 'pp-boton-abrir'}
        aria-label={`Ver formato de ${p.nombre}`}
        tooltip={conTexto ? undefined : 'Ver formato'}
        tooltipOptions={{ position: 'top' }}
        onClick={(e) => {
          e.stopPropagation();
          setFormato(p.formato);
        }}
      />
    ) : null;

  const subirVersion = (p: Plantilla, archivo: string) => {
    almacenPlantillas.escribir((lista) =>
      lista.map((x) => (x.id === p.id ? { ...x, versiones: [...x.versiones, { version: ultima(x).version + 1, archivo, usuario: usuario.nombre, fecha: ahoraIso() }] } : x)),
    );
    aviso.current?.show({ severity: 'success', summary: `Versión ${ultima(p).version + 1} cargada`, detail: 'Campos validados. Los documentos nuevos usarán esta versión.', life: 3200 });
  };

  return (
    <div className="pagina-papeletas">
      <header className="pp-encabezado">
        <h1>Plantillas</h1>
        <div className="pp-encabezado__acciones">
          <Button label="Cargar plantilla" icon="pi pi-upload" className="pp-boton-principal" onClick={() => setNueva(true)} />
        </div>
      </header>

      <TablaListado datos={plantillas} clave="id" nombrePlural="plantillas" vacio="Aún no hay plantillas." alAbrir={(p) => setIdDetalle(p.id)}>
        <Column header="Plantilla" body={(p: Plantilla) => <strong>{p.nombre}</strong>} />
        <Column header="Tipo" field="tipo" className="tr-col-gris" />
        <Column header="Versión" body={(p: Plantilla) => `v${ultima(p).version}`} />
        <Column header="Campos" body={(p: Plantilla) => p.campos.length} />
        <Column header="Actualizada" body={(p: Plantilla) => fechaCorta(ultima(p).fecha)} className="tr-col-gris" />
        <Column header="Formato" body={(p: Plantilla) => <div className="pp-acciones">{botonFormato(p)}</div>} className="pp-col-acciones" />
      </TablaListado>

      <Dialog visible={!!detalle} onHide={() => setIdDetalle(null)} showHeader={false} modal dismissableMask draggable={false} className="pp-panel" style={{ width: '540px' }} breakpoints={{ '640px': '94vw' }}>
        {detalle && (
          <div className="pp-panel__contenido">
            <header className="pp-panel__encabezado">
              <div>
                <span className="pp-panel__kicker">Plantilla · {detalle.tipo}</span>
                <h2 className="tr-nombre">{detalle.nombre}</h2>
              </div>
              <Button icon="pi pi-times" text rounded aria-label="Cerrar" className="pp-panel__cerrar" onClick={() => setIdDetalle(null)} />
            </header>
            <section>
              <h3 className="pp-panel__subtitulo">Campos que se llenan automáticamente</h3>
              <ul className="pl-campos">
                {detalle.campos.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="pp-panel__subtitulo">Versiones</h3>
              <ol className="pp-linea-tiempo">
                {[...detalle.versiones].reverse().map((v) => (
                  <li key={v.version}>
                    <span className="pp-linea-tiempo__punto">v{v.version}</span>
                    <div>
                      <strong>{v.archivo}</strong>
                      <small>
                        {v.usuario} · {momento(v.fecha)}
                      </small>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
            <footer className="pp-panel__pie">
              {botonFormato(detalle, true)}
              <div className="pp-panel__decision">
                <Button label="Descargar" icon="pi pi-download" outlined className="pp-boton-secundario" onClick={() => aviso.current?.show({ severity: 'info', summary: 'Descarga simulada', detail: ultima(detalle).archivo, life: 2500 })} />
                <BotonArchivo etiqueta="Subir nueva versión" aceptar=".docx" clase="pp-boton-principal" alElegir={(n) => subirVersion(detalle, n)} />
              </div>
            </footer>
          </div>
        )}
      </Dialog>

      {/* Vista previa del formato con datos de ejemplo (no de un trabajador real). */}
      <VistaDocumento documento={formato && !esMemo(formato) ? documentoDeMuestra(formato) : null} visible={!!formato && !esMemo(formato)} esMuestra alCerrar={() => setFormato(null)} />
      <VistaMemorandum incidencia={formato && esMemo(formato) ? memorandumDeMuestra(formato.slice(5) as IdModelo) : null} visible={!!formato && esMemo(formato)} alCerrar={() => setFormato(null)} />

      <VentanaNuevaPlantilla
        visible={nueva}
        alCerrar={() => setNueva(false)}
        alGuardar={(nombre, tipo, archivo) => {
          almacenPlantillas.escribir((l) => [...l, { id: `pl-${Date.now()}`, nombre, tipo, campos: CAMPOS_BASE, versiones: [{ version: 1, archivo, usuario: usuario.nombre, fecha: ahoraIso() }] }]);
          setNueva(false);
          aviso.current?.show({ severity: 'success', summary: 'Plantilla cargada', detail: `Se detectaron ${CAMPOS_BASE.length} campos.`, life: 3000 });
        }}
      />
    </div>
  );
}

function VentanaNuevaPlantilla({ visible, alCerrar, alGuardar }: { visible: boolean; alCerrar: () => void; alGuardar: (nombre: string, tipo: string, archivo: string) => void }) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [archivo, setArchivo] = useState<string | null>(null);
  return (
    <Dialog
      visible={visible}
      onHide={alCerrar}
      onShow={() => {
        setNombre('');
        setArchivo(null);
      }}
      header="Cargar plantilla"
      className="pp-ventana"
      style={{ width: '500px' }}
      breakpoints={{ '640px': '94vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Cancelar" text onClick={alCerrar} />
          <Button label="Guardar" icon="pi pi-check" className="pp-boton-principal" disabled={!nombre.trim() || !archivo} onClick={() => archivo && alGuardar(nombre.trim(), tipo, archivo)} />
        </div>
      }
    >
      <div className="pp-formulario">
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Nombre *</span>
          <InputText value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Contrato a plazo indeterminado" />
        </label>
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Tipo</span>
          <Dropdown value={tipo} options={TIPOS} onChange={(e) => setTipo(e.value)} />
        </label>
        <div className="pp-campo">
          <span className="pp-campo__etiqueta">Archivo Word *</span>
          <ul className="dm-sustentos">
            <li className={archivo ? 'es-recibido' : ''}>
              <i className={archivo ? 'pi pi-check-circle' : 'pi pi-circle'} aria-hidden="true" />
              <div>
                <strong>{archivo ?? 'Plantilla .docx'}</strong>
                <small>Usa campos como {'{{nombre}}'}, {'{{dni}}'} o {'{{cargo}}'}.</small>
              </div>
              <BotonArchivo aceptar=".docx" alElegir={setArchivo} />
            </li>
          </ul>
        </div>
      </div>
    </Dialog>
  );
}
