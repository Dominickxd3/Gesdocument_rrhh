import { BarraFirma, LienzoFirma, useControlFirma } from '@/compartido/componentes/LienzoFirma';
import { useEffect, useRef, useState } from 'react';
import { guardarComoPdf, nombreArchivo } from '@/compartido/documentos/guardarComoPdf';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Insignia } from '@/compartido/componentes/Insignia';
import { SelectorTrabajador } from '@/compartido/componentes/SelectorTrabajador';
import { BotonArchivo, archivoSubido } from '@/compartido/componentes/BotonArchivo';
import { fechaLarga, hoyIso, momento } from '@/compartido/almacen/crearAlmacen';
import { useTrabajadores } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { nombreLegible } from '@/modulos/trabajadores/dominio/trabajador';
import { buscarTrabajador } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { TEXTO_ACTUACION, infoEstado, type Incidencia } from '../dominio/incidencia';
import { MODELOS_IMPUTACION, buscarModelo, hechosDeModelo, type IdModelo } from '../dominio/modelosImputacion';
import { HojaCartaImputacion } from './HojaCartaImputacion';

/** Documento del memorándum (vista previa e impresión). */
export function VistaMemorandum({
  incidencia: i,
  visible,
  alCerrar,
  alFirmar,
}: {
  incidencia: Incidencia | null;
  visible: boolean;
  alCerrar: () => void;
  /** Trabajador firmando la recepción: dibuja su firma sobre su línea del memorándum. */
  alFirmar?: (imagen: string) => void;
}) {
  const firma = i?.actuaciones.find((a) => a.tipo === 'firma');
  const firmando = !!alFirmar && !firma;
  const visor = useRef<HTMLDivElement>(null);
  const control = useControlFirma();
  const { borrar } = control;
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    if (visible) {
      borrar();
      setZoom(1);
    }
  }, [visible, borrar]);
  return (
    <Dialog
      visible={visible && !!i?.memorandum}
      onHide={alCerrar}
      header={i && (i.numero ? `Carta de imputación de cargos · Incidencia N° ${i.numero}` : 'Carta de imputación de cargos · vista previa del formato')}
      className="pp-ventana dm-ventana-documento"
      style={{ width: '820px' }}
      breakpoints={{ '860px': '100vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          {!firmando && i && (
            <Button
              label="Descargar PDF"
              icon="pi pi-download"
              outlined
              className="pp-boton-secundario"
              onClick={() => void guardarComoPdf(visor.current, nombreArchivo('Memorándum', `N° ${String(i.numero).padStart(4, '0')}`, i.trabajador))}
            />
          )}
          <span className="pp-espaciador" />
          {firmando ? (
            <Button label="Cancelar" text onClick={alCerrar} />
          ) : (
            <Button label="Cerrar" className="pp-boton-principal" onClick={alCerrar} />
          )}
        </div>
      }
    >
      {i?.memorandum && (
        <div className="dm-visor" style={{ zoom }} ref={visor}>
          <HojaCartaImputacion
            modelo={i.memorandum.modelo}
            trabajador={i.trabajador}
            dni={i.dni}
            area={buscarTrabajador(i.dni)?.area ?? '[Área del trabajador]'}
            fecha={i.memorandum.emitido}
            hechos={i.memorandum.texto}
            plazo={i.memorandum.plazo}
            firma={
              firma?.firmaImagen ? (
                <img src={firma.firmaImagen} alt={`Firma de ${nombreLegible(i.trabajador)}`} className="doc-firma-trabajador" />
              ) : firma ? (
                <em className="doc-hoja__firmado">Recibido y firmado</em>
              ) : firmando ? (
                <LienzoFirma control={control} />
              ) : (
                <small className="ing-firma__pendiente">Pendiente de firma digital</small>
              )
            }
          />
        </div>
      )}
      {firmando && i?.memorandum && (
        <BarraFirma
          control={control}
          zoom={zoom}
          alCambiarZoom={setZoom}
          alEnviar={() => {
            const imagen = control.imagen();
            if (imagen) alFirmar?.(imagen);
          }}
        />
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
  alFirmar?: (i: Incidencia, imagen: string) => void;
}

/** Detalle de la incidencia (RR. HH.) o del memorándum (trabajador), en ventana centrada. */
export function VentanaIncidencia({ incidencia: i, modo, alCerrar, ...acciones }: PropiedadesDetalle) {
  const [viendo, setViendo] = useState(false);
  const [acepto, setAcepto] = useState(false);
  const [firmando, setFirmando] = useState(false);
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
                {momento(memo.fecha)} · {i.memorandum && buscarModelo(i.memorandum.modelo).nombre}
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
            <Button label="Firmar recepción" icon="pi pi-pencil" className="pp-boton-aprobar dm-boton-ancho" disabled={!acepto} onClick={() => setFirmando(true)} />
          </footer>
        )}
      </div>
      <VistaMemorandum incidencia={i} visible={viendo} alCerrar={() => setViendo(false)} />
      <VistaMemorandum
        incidencia={i}
        visible={firmando}
        alCerrar={() => setFirmando(false)}
        alFirmar={(imagen) => {
          setFirmando(false);
          acciones.alFirmar?.(i, imagen);
        }}
      />
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
        <SelectorTrabajador opciones={trabajadores.map((t) => ({ dni: t.dni, nombre: t.nombre, detalle: `${t.cargo} · ${t.area}` }))} valor={dni} alCambiar={setDni} />
        <div className="inc-asunto-fecha">
          <label className="pp-campo">
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
  alEmitir: (i: Incidencia, modelo: IdModelo, texto: string, plazo: number) => void;
}) {
  const [modelo, setModelo] = useState<IdModelo>('funciones');
  const [texto, setTexto] = useState('');
  const [plazo, setPlazo] = useState(6);
  // Al abrir: el modelo que corresponde al asunto de la incidencia, si coincide con alguno.
  useEffect(() => {
    if (i) setModelo(MODELOS_IMPUTACION.find((m) => m.nombre === i.asunto)?.id ?? 'funciones');
  }, [i]);
  useEffect(() => {
    if (!i) return;
    const m = buscarModelo(modelo);
    setTexto(hechosDeModelo(m, fechaLarga(i.fecha)));
    setPlazo(m.plazo);
  }, [i, modelo]);

  return (
    <Dialog
      visible={!!i}
      onHide={alCerrar}
      header="Emitir carta de imputación de cargos"
      className="pp-ventana"
      style={{ width: '640px' }}
      breakpoints={{ '680px': '100vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Cancelar" text onClick={alCerrar} />
          <Button label="Emitir y enviar al trabajador" icon="pi pi-send" className="pp-boton-principal" disabled={!texto.trim()} onClick={() => i && alEmitir(i, modelo, texto, plazo)} />
        </div>
      }
    >
      <div className="pp-formulario">
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Modelo de carta de imputación</span>
          <Dropdown value={modelo} options={MODELOS_IMPUTACION} optionLabel="nombre" optionValue="id" filter onChange={(e) => setModelo(e.value)} />
          <small className="pp-campo__ayuda">{buscarModelo(modelo).asunto}. El fundamento del Reglamento Interno se completa solo.</small>
        </label>
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Plazo de descargos (días calendario)</span>
          <Dropdown value={plazo} options={[1, 3, 5, 6]} onChange={(e) => setPlazo(e.value)} />
        </label>
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Hechos que se imputan</span>
          <InputTextarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={9} autoResize />
          <small className="pp-campo__ayuda">Revisa y ajusta el texto antes de emitir. El trabajador lo verá en "Mis memorándums" para firmar la recepción.</small>
        </label>
      </div>
    </Dialog>
  );
}
