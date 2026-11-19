import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Insignia } from '@/compartido/componentes/Insignia';
import { BotonArchivo, archivoSubido } from '@/compartido/componentes/BotonArchivo';
import { fechaLarga, hoyIso, momento } from '@/compartido/almacen/crearAlmacen';
import { useTrabajadores } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { nombreLegible } from '@/modulos/trabajadores/dominio/trabajador';
import { MEDIDAS, TEXTO_ACTUACION, infoEstado, textoMemorandum, type Incidencia } from '../dominio/incidencia';

/** Documento del memorándum (vista previa e impresión). */
export function VistaMemorandum({ incidencia: i, visible, alCerrar }: { incidencia: Incidencia | null; visible: boolean; alCerrar: () => void }) {
  const firma = i?.actuaciones.find((a) => a.tipo === 'firma');
  return (
    <Dialog
      visible={visible && !!i?.memorandum}
      onHide={alCerrar}
      header={i && `Memorándum · Incidencia N° ${i.numero}`}
      className="pp-ventana dm-ventana-documento"
      style={{ width: '820px' }}
      breakpoints={{ '860px': '100vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Imprimir" icon="pi pi-print" text onClick={() => window.print()} />
          <span className="pp-espaciador" />
          <Button label="Cerrar" className="pp-boton-principal" onClick={alCerrar} />
        </div>
      }
    >
      {i?.memorandum && (
        <div className="dm-visor">
          <article className="doc-hoja">
            <header>
              <img src="/isotipo-empresa.png" alt="" />
              <small>
                GRUPO PECUARIO S.A.C.
                <br />
                Lima, {fechaLarga(i.memorandum.emitido)}
              </small>
            </header>
            <h3>MEMORÁNDUM N° {String(i.numero).padStart(4, '0')}-GH</h3>
            <p>
              <strong>Para:</strong> {i.trabajador}
              <br />
              <strong>De:</strong> Gestión Humana
              <br />
              <strong>Asunto:</strong> {i.asunto}
            </p>
            {i.memorandum.texto.split('\n\n').map((p) => (
              <p key={p}>{p}</p>
            ))}
            <div className="doc-hoja__firmas">
              <div>
                <span />
                Jefatura de Gestión Humana
              </div>
              <div>
                {firma ? <em className="doc-hoja__firmado">Recibido y firmado · {momento(firma.fecha)}</em> : <span />}
                {nombreLegible(i.trabajador)}
              </div>
            </div>
          </article>
        </div>
      )}
    </Dialog>
  );
}

interface PropiedadesDetalle {
  incidencia: Incidencia | null;
  modo: 'rrhh' | 'trabajador';
  alCerrar: () => void;
  alActuacion?: (i: Incidencia) => void;
  alCerrarSinMemo?: (i: Incidencia) => void;
  alEmitir?: (i: Incidencia) => void;
  alFirmar?: (i: Incidencia) => void;
}

/** Detalle de la incidencia (RR. HH.) o del memorándum (trabajador), en ventana centrada. */
export function VentanaIncidencia({ incidencia: i, modo, alCerrar, ...acciones }: PropiedadesDetalle) {
  const [viendo, setViendo] = useState(false);
  const [acepto, setAcepto] = useState(false);
  if (!i) return null;

  const estado = infoEstado(i.estado);
  const esRrhh = modo === 'rrhh';
  const abierta = i.estado === 'registrada' || i.estado === 'en_investigacion';
  const firma = i.actuaciones.find((a) => a.tipo === 'firma');
  const cierre = i.actuaciones.find((a) => a.tipo === 'cierre');
  const memo = i.actuaciones.find((a) => a.tipo === 'memo');

  return (
    <Dialog visible onHide={alCerrar} showHeader={false} modal dismissableMask draggable={false} className="pp-panel" style={{ width: '560px' }} breakpoints={{ '640px': '94vw' }}>
      <div className="pp-panel__contenido">
        <header className="pp-panel__encabezado">
          <div>
            <span className="pp-panel__kicker">{esRrhh ? `Incidencia N° ${i.numero}` : 'Memorándum'}</span>
            <h2 className="tr-nombre">{i.asunto}</h2>
          </div>
          <Insignia tono={estado.tono}>{estado.etiqueta}</Insignia>
          <Button icon="pi pi-times" text rounded aria-label="Cerrar" className="pp-panel__cerrar" onClick={alCerrar} />
        </header>

        {firma && (
          <div className="dm-resolucion es-aprobado">
            <i className="pi pi-check-circle" aria-hidden="true" />
            <div>
              <strong>Recepción firmada por {firma.usuario}</strong>
              <small>{momento(firma.fecha)}</small>
            </div>
          </div>
        )}
        {!firma && memo && (
          <div className="dm-resolucion es-observado">
            <i className="pi pi-send" aria-hidden="true" />
            <div>
              <strong>Memorándum emitido por {memo.usuario}</strong>
              <small>
                {momento(memo.fecha)} · Medida: {i.memorandum?.medida}
              </small>
            </div>
          </div>
        )}
        {cierre && (
          <div className="dm-resolucion es-aprobado">
            <i className="pi pi-lock" aria-hidden="true" />
            <div>
              <strong>Cerrada sin memorándum por {cierre.usuario}</strong>
              <small>{momento(cierre.fecha)}</small>
              <p>“{cierre.texto}”</p>
            </div>
          </div>
        )}

        <dl className="pp-panel__datos">
          {esRrhh && (
            <div className="ancho-completo">
              <dt>Trabajador</dt>
              <dd>
                {i.trabajador} · DNI {i.dni}
              </dd>
            </div>
          )}
          <div>
            <dt>Fecha de los hechos</dt>
            <dd>{fechaLarga(i.fecha)}</dd>
          </div>
          <div>
            <dt>Reportado por</dt>
            <dd>{nombreLegible(i.reportadoPor)}</dd>
          </div>
          {esRrhh && (
            <div className="ancho-completo">
              <dt>Descripción</dt>
              <dd className="pp-panel__cita">{i.descripcion}</dd>
            </div>
          )}
        </dl>

        {esRrhh && (
          <section>
            <h3 className="pp-panel__subtitulo">Evidencias</h3>
            {i.evidencias.length === 0 ? (
              <p className="tr-nota">Sin evidencias adjuntas.</p>
            ) : (
              <ul className="dm-sustentos">
                {i.evidencias.map((e) => (
                  <li key={e} className="es-recibido">
                    <i className="pi pi-paperclip" aria-hidden="true" />
                    <div>
                      <strong>{e}</strong>
                    </div>
                    {archivoSubido(e) && <Button label="Ver" icon="pi pi-eye" text size="small" onClick={() => window.open(archivoSubido(e)!.url, '_blank', 'noopener')} />}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {i.memorandum && <Button label="Ver memorándum" icon="pi pi-eye" outlined className="pp-boton-secundario dm-boton-ancho" onClick={() => setViendo(true)} />}

        {esRrhh && (
          <section>
            <h3 className="pp-panel__subtitulo">Actuaciones</h3>
            <ol className="pp-linea-tiempo">
              {[...i.actuaciones].reverse().map((a, n) => (
                <li key={n} className={a.tipo === 'firma' || a.tipo === 'cierre' ? 'es-aprobada' : ''}>
                  <span className="pp-linea-tiempo__punto">
                    <i className={TEXTO_ACTUACION[a.tipo].icono} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>
                      {a.usuario} · {TEXTO_ACTUACION[a.tipo].texto}
                    </strong>
                    <small>{momento(a.fecha)}</small>
                    {a.texto && a.tipo !== 'cierre' && <p>“{a.texto}”</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {esRrhh && abierta && (
          <footer className="pp-panel__pie">
            <Button label="Registrar actuación o explicación" icon="pi pi-plus" text className="dm-boton-ancho" onClick={() => acciones.alActuacion?.(i)} />
            <div className="pp-panel__decision">
              <Button label="Cerrar sin memorándum" icon="pi pi-lock" outlined className="pp-boton-secundario" onClick={() => acciones.alCerrarSinMemo?.(i)} />
              <Button label="Emitir memorándum" icon="pi pi-file-edit" className="pp-boton-principal" onClick={() => acciones.alEmitir?.(i)} />
            </div>
          </footer>
        )}
        {!esRrhh && i.estado === 'memo_emitido' && (
          <footer className="pp-panel__pie">
            <label className="dm-verificacion">
              <Checkbox checked={acepto} onChange={(e) => setAcepto(!!e.checked)} />
              <span>
                <strong>Confirmo que recibí y leí el memorándum</strong>
                <small>Firmar la recepción no significa estar de acuerdo con la medida.</small>
              </span>
            </label>
            <Button label="Firmar recepción" icon="pi pi-pencil" className="pp-boton-aprobar dm-boton-ancho" disabled={!acepto} onClick={() => acciones.alFirmar?.(i)} />
          </footer>
        )}
      </div>
      <VistaMemorandum incidencia={i} visible={viendo} alCerrar={() => setViendo(false)} />
    </Dialog>
  );
}

/** CUS29: registrar una incidencia con evidencias. */
export function VentanaRegistroIncidencia({
  visible,
  alCerrar,
  alGuardar,
}: {
  visible: boolean;
  alCerrar: () => void;
  alGuardar: (datos: Pick<Incidencia, 'dni' | 'trabajador' | 'fecha' | 'asunto' | 'descripcion' | 'evidencias'>) => void;
}) {
  const trabajadores = useTrabajadores();
  const [dni, setDni] = useState<string | null>(null);
  const [fecha, setFecha] = useState(hoyIso());
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [evidencias, setEvidencias] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    setDni(null);
    setFecha(hoyIso());
    setAsunto('');
    setDescripcion('');
    setEvidencias([]);
  }, [visible]);

  const t = trabajadores.find((x) => x.dni === dni);
  const listo = !!t && asunto.trim() && descripcion.trim();

  return (
    <Dialog
      visible={visible}
      onHide={alCerrar}
      header="Registrar incidencia"
      className="pp-ventana"
      style={{ width: '600px' }}
      breakpoints={{ '640px': '100vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Cancelar" text onClick={alCerrar} />
          <Button
            label="Registrar"
            icon="pi pi-check"
            className="pp-boton-principal"
            disabled={!listo}
            onClick={() => t && alGuardar({ dni: t.dni, trabajador: t.nombre, fecha, asunto: asunto.trim(), descripcion: descripcion.trim(), evidencias })}
          />
        </div>
      }
    >
      <div className="pp-formulario">
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Trabajador *</span>
          <Dropdown value={dni} options={trabajadores} optionLabel="nombre" optionValue="dni" filter filterBy="nombre,dni" placeholder="Buscar por nombre o DNI" onChange={(e) => setDni(e.value)} />
        </label>
        <div className="dm-rejilla-fechas">
          <label className="pp-campo" style={{ gridColumn: 'span 2' }}>
            <span className="pp-campo__etiqueta">Asunto *</span>
            <InputText value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="Ej.: Tardanzas reiteradas" />
          </label>
          <label className="pp-campo">
            <span className="pp-campo__etiqueta">Fecha *</span>
            <input type="date" className="p-inputtext" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </label>
        </div>
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">¿Qué ocurrió? *</span>
          <InputTextarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} autoResize />
        </label>
        <div className="pp-campo">
          <span className="pp-campo__etiqueta">Evidencias</span>
          <ul className="dm-sustentos">
            {evidencias.map((e) => (
              <li key={e} className="es-recibido">
                <i className="pi pi-paperclip" aria-hidden="true" />
                <div>
                  <strong>{e}</strong>
                </div>
                <Button icon="pi pi-times" text rounded size="small" aria-label="Quitar" onClick={() => setEvidencias(evidencias.filter((x) => x !== e))} />
              </li>
            ))}
          </ul>
          <BotonArchivo etiqueta="Adjuntar evidencia" alElegir={(n) => setEvidencias((l) => [...l, n])} />
        </div>
      </div>
    </Dialog>
  );
}

/** CUS34 + CUS35: generar el memorándum desde la plantilla, revisarlo y emitirlo. */
export function VentanaEmitirMemorandum({
  incidencia: i,
  alCerrar,
  alEmitir,
}: {
  incidencia: Incidencia | null;
  alCerrar: () => void;
  alEmitir: (i: Incidencia, medida: string, texto: string) => void;
}) {
  const [medida, setMedida] = useState(MEDIDAS[0]);
  const [texto, setTexto] = useState('');
  useEffect(() => {
    if (i) setTexto(textoMemorandum(i.trabajador, i.dni, i.asunto, fechaLarga(i.fecha), medida));
  }, [i, medida]);

  return (
    <Dialog
      visible={!!i}
      onHide={alCerrar}
      header="Emitir memorándum"
      className="pp-ventana"
      style={{ width: '640px' }}
      breakpoints={{ '680px': '100vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Cancelar" text onClick={alCerrar} />
          <Button label="Emitir y enviar al trabajador" icon="pi pi-send" className="pp-boton-principal" disabled={!texto.trim()} onClick={() => i && alEmitir(i, medida, texto)} />
        </div>
      }
    >
      <div className="pp-formulario">
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Medida</span>
          <Dropdown value={medida} options={MEDIDAS} onChange={(e) => setMedida(e.value)} />
        </label>
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Texto (generado desde la plantilla "Memorándum")</span>
          <InputTextarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={9} autoResize />
          <small className="pp-campo__ayuda">Revisa y ajusta el texto antes de emitir. El trabajador lo verá en "Mis memorándums" para firmar la recepción.</small>
        </label>
      </div>
    </Dialog>
  );
}
