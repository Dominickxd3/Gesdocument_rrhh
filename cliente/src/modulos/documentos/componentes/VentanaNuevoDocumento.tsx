import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Checkbox } from 'primereact/checkbox';
import { BotonArchivo } from '@/compartido/componentes/BotonArchivo';
import { SelectorTrabajador } from '@/compartido/componentes/SelectorTrabajador';
import { fechaLarga, hoyIso } from '@/compartido/almacen/crearAlmacen';
import { montoSoles } from '@/compartido/formato/montos';
import { useTrabajadores } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { TEXTO_MODALIDAD } from '@/modulos/trabajadores/dominio/trabajador';
import { TIPOS_DOCUMENTO, type Documento, type TipoDocumento } from '../dominio/documento';
import { CLAUSULAS_ESPECIALES, MOTIVOS_ADENDA, clausulasSugeridas, type ClausulaEspecial, type MotivoAdenda } from '../dominio/plantillaAdenda';
import { datosAdenda, datosContrato } from '../aplicacion/almacenDocumentos';
import { calcularHasta } from '../dominio/plantillaContrato';
import { CamposContrato, contratoCompleto, contratoInicial, type FormularioContrato } from './CamposContrato';

interface Propiedades {
  visible: boolean;
  dniInicial?: string;
  alCerrar: () => void;
  alCrear: (datos: Pick<Documento, 'dni' | 'trabajador' | 'tipo' | 'origen' | 'adenda' | 'contrato'>, enviar: boolean) => void;
}

/** CUS42 generar desde plantilla / CUS43 cargar y clasificar un documento del trabajador. */
export function VentanaNuevoDocumento({ visible, dniInicial, alCerrar, alCrear }: Propiedades) {
  const trabajadores = useTrabajadores();
  const [dni, setDni] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoDocumento>('contrato');
  const [origen, setOrigen] = useState<'plantilla' | 'archivo'>('plantilla');
  const [archivo, setArchivo] = useState<string | null>(null);
  // Datos propios de la adenda (lo demás sale de la ficha del trabajador).
  const [motivo, setMotivo] = useState<MotivoAdenda>('cambio');
  const [cargoNuevo, setCargoNuevo] = useState('');
  const [cambiaSueldo, setCambiaSueldo] = useState(true);
  const [sueldoNuevo, setSueldoNuevo] = useState<number | null>(null);
  const [especiales, setEspeciales] = useState<ClausulaEspecial[]>([]);
  const [fechaFirma, setFechaFirma] = useState(hoyIso());
  // Datos propios del contrato.
  const [contrato, setContrato] = useState<FormularioContrato>(contratoInicial('', null, hoyIso()));

  useEffect(() => {
    if (!visible) return;
    setDni(dniInicial ?? null);
    setTipo('contrato');
    setOrigen('plantilla');
    setArchivo(null);
    setCargoNuevo('');
    setCambiaSueldo(true);
    setSueldoNuevo(null);
    setEspeciales([]);
    setMotivo('cambio');
    setFechaFirma(hoyIso());
  }, [visible, dniInicial]);

  const trabajador = trabajadores.find((t) => t.dni === dni);

  // Al elegir trabajador, el contrato parte de su cargo y su sueldo de la ficha.
  useEffect(() => {
    setContrato(contratoInicial(trabajador?.contrato.cargo ?? '', trabajador?.contrato.remuneracion ?? null, hoyIso()));
  }, [trabajador]);

  const esAdenda = tipo === 'adenda' && origen === 'plantilla';
  const esContrato = tipo === 'contrato' && origen === 'plantilla';
  const esVendedor = motivo === 'obligaciones_vendedor';
  const adendaLista = !esAdenda || (fechaFirma && (esVendedor || (cargoNuevo.trim() && (!cambiaSueldo || (sueldoNuevo ?? 0) > 0))));
  const contratoListo = !esContrato || contratoCompleto(contrato);
  const listo = !!trabajador && (origen === 'plantilla' || !!archivo) && adendaLista && contratoListo;

  const cambiarCargo = (valor: string) => {
    setCargoNuevo(valor);
    // Sugiere las cláusulas del cargo (cobranzas, ventas); RR. HH. puede quitarlas o agregar otras.
    setEspeciales((actuales) => [...new Set([...actuales.filter((e) => e === 'jornada_rotativa'), ...clausulasSugeridas(valor)])]);
  };

  const crear = (enviar: boolean) => {
    if (!trabajador) return;
    alCrear(
      {
        dni: trabajador.dni,
        trabajador: trabajador.nombre,
        tipo,
        origen: origen === 'archivo' && archivo ? { tipo: 'archivo', nombre: archivo } : { tipo: 'plantilla' },
        adenda: esAdenda
          ? {
              ...datosAdenda(trabajador, {
                cargoNuevo: esVendedor ? trabajador.contrato.cargo : cargoNuevo.trim(),
                remuneracionNueva: esVendedor ? null : cambiaSueldo ? sueldoNuevo : null,
                especiales: esVendedor ? [] : especiales,
                fechaFirma,
              }),
              motivo,
            }
          : undefined,
        contrato: esContrato
          ? datosContrato(trabajador, {
              cargo: contrato.cargo.trim(),
              confianza: contrato.confianza,
              meses: contrato.meses,
              desde: contrato.desde,
              hasta: calcularHasta(contrato.desde, contrato.meses),
              remuneracion: contrato.remuneracion ?? 0,
              asignacionFamiliar: contrato.asignacionFamiliar,
              horario1: contrato.horario1.trim(),
              horario2: contrato.horario2.trim(),
              funciones: contrato.funciones.split('\n').map((f) => f.trim()).filter(Boolean),
              adendaVendedor: contrato.adendaVendedor,
            })
          : undefined,
      },
      enviar,
    );
  };

  return (
    <Dialog
      visible={visible}
      onHide={alCerrar}
      header="Nuevo documento"
      className="pp-ventana"
      style={{ width: '620px' }}
      breakpoints={{ '680px': '100vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Cancelar" text onClick={alCerrar} />
          <Button label="Guardar borrador" outlined className="pp-boton-secundario" disabled={!listo} onClick={() => crear(false)} />
          <Button label="Enviar para firma" icon="pi pi-send" className="pp-boton-principal" disabled={!listo} onClick={() => crear(true)} />
        </div>
      }
    >
      <div className="pp-formulario">
        <SelectorTrabajador opciones={trabajadores.map((t) => ({ dni: t.dni, nombre: t.nombre, detalle: `${t.cargo} · ${t.area}` }))} valor={dni} alCambiar={setDni} />
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Tipo de documento *</span>
          <Dropdown value={tipo} options={TIPOS_DOCUMENTO} optionLabel="etiqueta" optionValue="valor" onChange={(e) => setTipo(e.value)} />
        </label>
        <div className="pp-campo">
          <span className="pp-campo__etiqueta">¿Cómo se crea?</span>
          <div className="pp-opciones-tipo" role="radiogroup">
            <button type="button" role="radio" aria-checked={origen === 'plantilla'} className={`pp-opcion-tipo${origen === 'plantilla' ? ' es-activa' : ''}`} onClick={() => setOrigen('plantilla')}>
              <i className="pi pi-table" aria-hidden="true" /> Generar desde plantilla
            </button>
            <button type="button" role="radio" aria-checked={origen === 'archivo'} className={`pp-opcion-tipo${origen === 'archivo' ? ' es-activa' : ''}`} onClick={() => setOrigen('archivo')}>
              <i className="pi pi-upload" aria-hidden="true" /> Subir archivo
            </button>
          </div>
          {origen === 'plantilla' && !esAdenda && !esContrato && (
            <small className="pp-campo__ayuda">Se completan solos el nombre, DNI, cargo, área y fecha de ingreso del trabajador.</small>
          )}
          {origen === 'archivo' && (
            <ul className="dm-sustentos">
              <li className={archivo ? 'es-recibido' : ''}>
                <i className={archivo ? 'pi pi-check-circle' : 'pi pi-circle'} aria-hidden="true" />
                <div>
                  <strong>Archivo</strong>
                  <small>{archivo ?? 'PDF, Word o imagen'}</small>
                </div>
                <BotonArchivo alElegir={setArchivo} />
              </li>
            </ul>
          )}
        </div>

        {esContrato && (trabajador ? <CamposContrato valor={contrato} alCambiar={setContrato} /> : <p className="tr-nota">Elige al trabajador: su nombre, DNI y domicilio se toman de su ficha.</p>)}

        {esAdenda && (
          <section className="pp-seccion">
            <h3 className="pp-seccion__titulo">
              <span>
                <i className="pi pi-file-edit" aria-hidden="true" />
              </span>{' '}
              Datos de la adenda
            </h3>

            {trabajador ? (
              <dl className="doc-contrato">
                <div>
                  <dt>Contrato vigente</dt>
                  <dd>{TEXTO_MODALIDAD[trabajador.contrato.modalidad].replace('Contrato de Trabajo a ', '')}</dd>
                </div>
                <div>
                  <dt>Suscrito el</dt>
                  <dd>{fechaLarga(trabajador.contrato.fecha)}</dd>
                </div>
                <div>
                  <dt>Cargo actual</dt>
                  <dd>{trabajador.contrato.cargo}</dd>
                </div>
                <div>
                  <dt>Remuneración actual</dt>
                  <dd>S/ {trabajador.contrato.remuneracion.toLocaleString('en-US', { minimumFractionDigits: 2 })}</dd>
                </div>
              </dl>
            ) : (
              <p className="tr-nota">Elige al trabajador: su contrato vigente, domicilio y sueldo se toman de su ficha.</p>
            )}

            <div className="pp-campo">
              <span className="pp-campo__etiqueta">Tipo de adenda</span>
              <div className="pp-opciones-tipo" role="radiogroup" aria-label="Tipo de adenda">
                {MOTIVOS_ADENDA.map((m) => (
                  <button
                    key={m.valor}
                    type="button"
                    role="radio"
                    aria-checked={motivo === m.valor}
                    className={`pp-opcion-tipo${motivo === m.valor ? ' es-activa' : ''}`}
                    onClick={() => setMotivo(m.valor)}
                  >
                    {m.etiqueta}
                  </button>
                ))}
              </div>
              {esVendedor && <small className="pp-campo__ayuda">Se agregan las 14 obligaciones del vendedor y la cláusula de cobranzas del RIT (art. 92 inc. rr).</small>}
            </div>

            {!esVendedor && (
            <>
            <label className="pp-campo">
              <span className="pp-campo__etiqueta">Cargo nuevo *</span>
              <InputText value={cargoNuevo} onChange={(e) => cambiarCargo(e.target.value)} placeholder="Ej.: AUXILIAR DE COBRANZAS" />
            </label>

            <div className="pp-campo">
              <label className="pp-interruptor">
                <InputSwitch checked={cambiaSueldo} onChange={(e) => setCambiaSueldo(!!e.value)} />
                Cambia la remuneración
              </label>
              {cambiaSueldo && (
                <>
                  <InputNumber value={sueldoNuevo} onValueChange={(e) => setSueldoNuevo(e.value ?? null)} mode="currency" currency="PEN" locale="es-PE" min={0} placeholder="Nueva remuneración mensual" />
                  {!!sueldoNuevo && <small className="pp-campo__ayuda">En el documento: {montoSoles(sueldoNuevo)}</small>}
                </>
              )}
            </div>

            <div className="pp-campo">
              <span className="pp-campo__etiqueta">Cláusulas especiales</span>
              {CLAUSULAS_ESPECIALES.map((c) => (
                <label key={c.valor} className="dm-verificacion">
                  <Checkbox
                    checked={especiales.includes(c.valor)}
                    onChange={(e) => setEspeciales((l) => (e.checked ? [...l, c.valor] : l.filter((x) => x !== c.valor)))}
                  />
                  <span>
                    <strong>{c.etiqueta}</strong>
                    <small>{c.ayuda}</small>
                  </span>
                </label>
              ))}
              <small className="pp-campo__ayuda">Se sugieren según el cargo nuevo; las cláusulas se numeran solas.</small>
            </div>
            </>
            )}

            <label className="pp-campo">
              <span className="pp-campo__etiqueta">Fecha de firma *</span>
              <input type="date" className="p-inputtext" value={fechaFirma} onChange={(e) => setFechaFirma(e.target.value)} />
            </label>
          </section>
        )}
      </div>
    </Dialog>
  );
}
