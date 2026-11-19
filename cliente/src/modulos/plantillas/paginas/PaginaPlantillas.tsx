import { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
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

/** Plantillas documentales (RF05, CUS41): Word con campos {{...}} que se llenan con la ficha del trabajador. */
interface Plantilla {
  id: string;
  nombre: string;
  tipo: string;
  campos: string[];
  versiones: { version: number; archivo: string; usuario: string; fecha: string }[];
}

const TIPOS = ['Contrato', 'Adenda', 'Constancia', 'Cargo de recepción', 'Declaración jurada', 'Memorándum'];
const CAMPOS_BASE = ['{{nombre}}', '{{dni}}', '{{cargo}}', '{{area}}', '{{fecha_ingreso}}'];

const almacenPlantillas = crearAlmacen<Plantilla[]>(() => [
  { id: 'pl-1', nombre: 'Contrato de trabajo a plazo fijo', tipo: 'Contrato', campos: [...CAMPOS_BASE, '{{fecha_fin}}', '{{sueldo}}'], versiones: [{ version: 1, archivo: 'contrato_plazo_fijo_v1.docx', usuario: 'Carlos Ramírez', fecha: haceDias(120) }, { version: 2, archivo: 'contrato_plazo_fijo_v2.docx', usuario: 'Carlos Ramírez', fecha: haceDias(30) }] },
  { id: 'pl-2', nombre: 'Adenda de prórroga', tipo: 'Adenda', campos: [...CAMPOS_BASE, '{{fecha_fin}}'], versiones: [{ version: 1, archivo: 'adenda_prorroga.docx', usuario: 'María Torres', fecha: haceDias(60) }] },
  { id: 'pl-3', nombre: 'Constancia de trabajo', tipo: 'Constancia', campos: CAMPOS_BASE, versiones: [{ version: 1, archivo: 'constancia.docx', usuario: 'María Torres', fecha: haceDias(200) }] },
  { id: 'pl-4', nombre: 'Cargo de Reglamento Interno', tipo: 'Cargo de recepción', campos: ['{{nombre}}', '{{dni}}'], versiones: [{ version: 1, archivo: 'cargo_rit.docx', usuario: 'María Torres', fecha: haceDias(90) }] },
  { id: 'pl-5', nombre: 'Cargo de entrega de EPP', tipo: 'Cargo de recepción', campos: ['{{nombre}}', '{{dni}}', '{{equipos}}'], versiones: [{ version: 1, archivo: 'cargo_epp.docx', usuario: 'Carlos Ramírez', fecha: haceDias(45) }] },
  { id: 'pl-6', nombre: 'Declaración jurada de domicilio', tipo: 'Declaración jurada', campos: ['{{nombre}}', '{{dni}}', '{{direccion}}'], versiones: [{ version: 1, archivo: 'dj_domicilio.docx', usuario: 'María Torres', fecha: haceDias(300) }] },
  { id: 'pl-7', nombre: 'Memorándum', tipo: 'Memorándum', campos: ['{{nombre}}', '{{dni}}', '{{asunto}}', '{{fecha_hechos}}', '{{medida}}'], versiones: [{ version: 1, archivo: 'memorandum.docx', usuario: 'Carlos Ramírez', fecha: haceDias(150) }] },
]);

const ultima = (p: Plantilla) => p.versiones[p.versiones.length - 1];

export function PaginaPlantillas() {
  const usuario = useUsuarioActual();
  const plantillas = almacenPlantillas.usar();
  const aviso = useRef<Toast>(null);
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [nueva, setNueva] = useState(false);
  const detalle = plantillas.find((p) => p.id === idDetalle) ?? null;

  const subirVersion = (p: Plantilla, archivo: string) => {
    almacenPlantillas.escribir((lista) =>
      lista.map((x) => (x.id === p.id ? { ...x, versiones: [...x.versiones, { version: ultima(x).version + 1, archivo, usuario: usuario.nombre, fecha: ahoraIso() }] } : x)),
    );
    aviso.current?.show({ severity: 'success', summary: `Versión ${ultima(p).version + 1} cargada`, detail: 'Campos validados. Los documentos nuevos usarán esta versión.', life: 3200 });
  };

  return (
    <div className="pagina-papeletas">
      <Toast ref={aviso} position="bottom-right" />
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
              <div className="pp-panel__decision">
                <Button label="Descargar" icon="pi pi-download" outlined className="pp-boton-secundario" onClick={() => aviso.current?.show({ severity: 'info', summary: 'Descarga simulada', detail: ultima(detalle).archivo, life: 2500 })} />
                <BotonArchivo etiqueta="Subir nueva versión" aceptar=".docx" clase="pp-boton-principal" alElegir={(n) => subirVersion(detalle, n)} />
              </div>
            </footer>
          </div>
        )}
      </Dialog>

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
