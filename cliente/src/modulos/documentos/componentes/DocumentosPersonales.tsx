import { useState } from 'react';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { SelectButton } from 'primereact/selectbutton';
import { BotonArchivo, archivoSubido } from '@/compartido/componentes/BotonArchivo';
import { momento } from '@/compartido/almacen/crearAlmacen';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { notificar } from '@/compartido/notificaciones/notificaciones';
import {
  FORMATOS,
  PEDIDOS_SUGERIDOS,
  cancelarPedido,
  editarPedido,
  pedidosDe,
  pedirPersonal,
  quitarPersonal,
  subirPersonal,
  usePersonales,
  type ArchivoPersonal,
  type FormatoPersonal,
  type PedidoPersonal,
} from '../aplicacion/almacenPersonales';

/**
 * Documentos personales del colaborador. Siempre se le piden su foto, su CV (PDF) y su DNI (imagen);
 * RR. HH. puede pedirle más documentos después. El colaborador los sube; RR. HH. los ve, los quita o pide otros.
 */
export function DocumentosPersonales({ dni, modo }: { dni: string; modo: 'rrhh' | 'trabajador' }) {
  const usuario = useUsuarioActual();
  const pedidos = pedidosDe(usePersonales(), dni);
  const [viendo, setViendo] = useState<{ nombre: string; archivo: ArchivoPersonal } | null>(null);
  // Ventana de pedido: nuevo (true) o corrigiendo uno ya hecho.
  const [pidiendo, setPidiendo] = useState<PedidoPersonal | true | null>(null);
  const [error, setError] = useState<string | null>(null);
  const entregados = pedidos.filter((p) => p.entregado).length;
  const faltan = pedidos.filter((p) => !p.entregado);
  const archivo = viendo ? archivoSubido(viendo.archivo.archivo) : undefined;

  const confirmar = (header: string, message: string, acceptLabel: string, accept: () => void) =>
    confirmDialog({
      group: 'personales',
      header,
      message,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel,
      rejectLabel: 'Cancelar',
      acceptClassName: 'boton-eliminar',
      rejectClassName: 'p-button-text boton-texto',
      accept,
    });

  return (
    <section className="expediente__seccion">
      <div className="personales__cabecera">
        <h3>
          <i className="pi pi-folder-open" aria-hidden="true" /> Documentos personales
          <span className="expediente__cantidad">
            {entregados}/{pedidos.length}
          </span>
        </h3>
        {modo === 'rrhh' && <Button label="Pedir documento" icon="pi pi-plus" outlined className="pp-boton-secundario" onClick={() => setPidiendo(true)} />}
      </div>
      <p className="personales__ayuda">
        {modo === 'trabajador'
          ? 'Sube tu foto, tu CV en PDF y tu DNI en imagen. Si Gestión Humana te pide otro documento, aparecerá aquí.'
          : 'El colaborador sube su foto, su CV y su DNI. Si necesitas otro documento, pídeselo y lo verá en su expediente.'}
      </p>
      {error && (
        <p className="personales__error" role="alert">
          <i className="pi pi-exclamation-circle" aria-hidden="true" /> {error}
        </p>
      )}

      <ul className="personales__lista">
        {pedidos.map((p) => {
          const f = FORMATOS[p.formato];
          return (
            <li key={p.id} className={p.entregado ? 'es-entregado' : 'es-pendiente'}>
              <i className={p.entregado ? 'pi pi-check-circle' : 'pi pi-clock'} aria-hidden="true" />
              <span className="personales__dato">
                <strong>{p.nombre}</strong>
                <small>
                  {f.etiqueta}
                  {p.entregado
                    ? ` · ${p.entregado.archivo} · subido el ${momento(p.entregado.fecha)}`
                    : p.pedidoPor
                      ? ` · pedido por ${p.pedidoPor}${p.fecha ? ` el ${momento(p.fecha)}` : ''}`
                      : ' · pendiente'}
                </small>
                {p.nota && !p.entregado && <small className="personales__nota">{p.nota}</small>}
              </span>
              <span className="personales__acciones">
                {p.entregado && <Button label="Ver" text size="small" onClick={() => setViendo({ nombre: p.nombre, archivo: p.entregado! })} />}
                {modo === 'trabajador' && (
                  <BotonArchivo
                    etiqueta={p.entregado ? 'Cambiar' : 'Subir'}
                    icono={p.entregado ? 'pi pi-refresh' : 'pi pi-upload'}
                    clase={p.entregado ? 'p-button-outlined pp-boton-secundario p-button-sm' : 'pp-boton-principal p-button-sm'}
                    aceptar={f.aceptar}
                    alElegir={(nombre) => {
                      if (!f.patron.test(nombre)) {
                        setError(`${p.nombre}: sube el archivo en formato ${f.etiqueta}.`);
                        return notificar.error('Formato no válido', `${p.nombre} debe subirse en ${f.etiqueta}.`);
                      }
                      setError(null);
                      subirPersonal(dni, p.id, nombre, usuario.nombre);
                      notificar.exito(p.entregado ? 'Archivo reemplazado' : 'Documento subido', `${p.nombre}: Gestión Humana ya puede verlo.`);
                    }}
                  />
                )}
                {modo === 'trabajador' && p.entregado && (
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    size="small"
                    severity="danger"
                    aria-label={`Eliminar ${p.nombre}`}
                    title="Eliminar archivo"
                    onClick={() =>
                      confirmar('Eliminar archivo', `Se eliminará ${p.entregado!.archivo}. Luego podrás subir el correcto.`, 'Eliminar', () => {
                        quitarPersonal(p.entregado!.id);
                        notificar.exito('Archivo eliminado', `Puedes subir de nuevo tu ${p.nombre.toLowerCase()}.`);
                      })
                    }
                  />
                )}
                {modo === 'rrhh' && !p.entregado && <span className="personales__pendiente">Pendiente</span>}
                {modo === 'rrhh' && (
                  <>
                    <Button icon="pi pi-pencil" text rounded size="small" severity="secondary" aria-label={`Editar el pedido de ${p.nombre}`} title="Editar pedido" onClick={() => setPidiendo(p)} />
                    <Button
                      icon="pi pi-times"
                      text
                      rounded
                      size="small"
                      severity="secondary"
                      aria-label={`Quitar el pedido de ${p.nombre}`}
                      title="Ya no pedir este documento"
                      onClick={() =>
                        confirmar(
                          'Quitar pedido',
                          p.entregado ? `Se quitará el pedido de «${p.nombre}» y se quitará el archivo que subió el colaborador.` : `El colaborador ya no verá el pedido de «${p.nombre}».`,
                          'Quitar pedido',
                          () => {
                            cancelarPedido(dni, p.id);
                            notificar.exito('Pedido quitado', `Ya no se le pedirá «${p.nombre}».`);
                          },
                        )
                      }
                    />
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {faltan.length > 0 && (
        <p className="personales__faltan">
          {modo === 'trabajador' ? 'Te falta subir' : 'Falta'}: {faltan.map((p) => p.nombre).join(', ')}.
        </p>
      )}

      <Dialog
        visible={!!viendo}
        onHide={() => setViendo(null)}
        header={
          viendo && (
            <div className="pp-ventana__titulo">
              <span>{viendo.nombre}</span>
              <small>
                {viendo.archivo.archivo} · {momento(viendo.archivo.fecha)}
              </small>
            </div>
          )
        }
        className="pp-ventana dm-ventana-documento"
        style={{ width: '820px' }}
        breakpoints={{ '860px': '100vw' }}
        draggable={false}
        footer={
          <div className="pp-ventana__pie">
            {archivo && <Button label="Descargar" icon="pi pi-download" outlined className="pp-boton-secundario" onClick={() => window.open(archivo.url, '_blank', 'noopener')} />}
            {modo === 'rrhh' && viendo && (
              <Button
                label="Quitar"
                icon="pi pi-trash"
                text
                severity="danger"
                title="El colaborador tendrá que volver a subirlo"
                onClick={() =>
                  confirmar('Quitar archivo', `Se quitará ${viendo.archivo.archivo} y el colaborador tendrá que volver a subirlo.`, 'Quitar', () => {
                    quitarPersonal(viendo.archivo.id);
                    notificar.exito('Archivo quitado', `El colaborador tendrá que volver a subir «${viendo.nombre}».`);
                    setViendo(null);
                  })
                }
              />
            )}
            <span className="pp-espaciador" />
            <Button label="Cerrar" className="pp-boton-principal" onClick={() => setViendo(null)} />
          </div>
        }
      >
        <div className="dm-visor personales__visor">
          {archivo ? (
            archivo.tipo.startsWith('image/') ? <img src={archivo.url} alt={viendo?.nombre} /> : <iframe src={archivo.url} title={viendo?.nombre} />
          ) : (
            <div className="personales__ejemplo">
              <i className="pi pi-file" aria-hidden="true" />
              <strong>{viendo?.archivo.archivo}</strong>
              <span>Archivo de ejemplo del prototipo: los archivos que se suban en esta sesión se verán aquí.</span>
            </div>
          )}
        </div>
      </Dialog>

      {pidiendo && <VentanaPedir dni={dni} usuario={usuario.nombre} pedido={pidiendo === true ? undefined : pidiendo} alCerrar={() => setPidiendo(null)} />}
      <ConfirmDialog group="personales" />
    </section>
  );
}

const OPCIONES_FORMATO = (Object.keys(FORMATOS) as FormatoPersonal[]).map((f) => ({ label: FORMATOS[f].etiqueta, value: f }));

function VentanaPedir({ dni, usuario, pedido, alCerrar }: { dni: string; usuario: string; pedido?: PedidoPersonal; alCerrar: () => void }) {
  const [nombre, setNombre] = useState(pedido?.nombre ?? '');
  const [formato, setFormato] = useState<FormatoPersonal>(pedido?.formato ?? 'pdf');
  const [nota, setNota] = useState(pedido?.nota ?? '');
  const cambiaFormato = !!pedido && formato !== pedido.formato;
  return (
    <Dialog
      visible
      onHide={alCerrar}
      header={pedido ? 'Editar pedido' : 'Pedir documento'}
      className="pp-ventana"
      style={{ width: '480px' }}
      breakpoints={{ '560px': '100vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <span className="pp-espaciador" />
          <Button label="Cancelar" text onClick={alCerrar} />
          <Button
            label={pedido ? 'Guardar' : 'Pedir'}
            icon={pedido ? 'pi pi-check' : 'pi pi-send'}
            className="pp-boton-principal"
            disabled={!nombre.trim()}
            onClick={() => {
              if (pedido) {
                editarPedido(dni, pedido.id, nombre.trim(), formato, nota.trim());
                notificar.exito('Pedido actualizado', `«${nombre.trim()}» en ${FORMATOS[formato].etiqueta}.`);
              } else {
                pedirPersonal(dni, nombre.trim(), formato, nota.trim(), usuario);
                notificar.exito('Documento pedido', `El colaborador verá «${nombre.trim()}» en su expediente.`);
              }
              alCerrar();
            }}
          />
        </div>
      }
    >
      <div className="personales__formulario">
        <label htmlFor="pedido-nombre">Documento</label>
        <Dropdown
          inputId="pedido-nombre"
          value={nombre}
          options={PEDIDOS_SUGERIDOS.map((s) => s.nombre)}
          editable
          placeholder="Elige o escribe el documento"
          onChange={(e) => {
            setNombre(e.value ?? '');
            const sugerido = PEDIDOS_SUGERIDOS.find((s) => s.nombre === e.value);
            if (sugerido) setFormato(sugerido.formato);
          }}
        />
        <label>Formato</label>
        <SelectButton value={formato} options={OPCIONES_FORMATO} onChange={(e) => e.value && setFormato(e.value)} allowEmpty={false} />
        {cambiaFormato && (
          <small className="personales__aviso-formato">
            <i className="pi pi-info-circle" aria-hidden="true" /> Si el colaborador ya subió un archivo en otro formato, se quitará para que lo suba en {FORMATOS[formato].etiqueta}.
          </small>
        )}
        <label htmlFor="pedido-nota">Indicaciones (opcional)</label>
        <InputTextarea id="pedido-nota" value={nota} onChange={(e) => setNota(e.target.value)} rows={3} autoResize placeholder="Ej.: con una antigüedad no mayor a 3 meses" />
      </div>
    </Dialog>
  );
}
