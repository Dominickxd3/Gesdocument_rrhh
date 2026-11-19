import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputSwitch } from 'primereact/inputswitch';
import {
  MOTIVO_MAXIMO,
  OBSERVACIONES_MAXIMO,
  TIPOS_PERMISO,
  duracionMinutos,
  formatearDuracion,
  validarPapeleta,
  type DatosPapeleta,
  type Papeleta,
  type Trabajador,
} from '../dominio/papeleta';
import { HOY, TRABAJADORES } from '../infraestructura/datosPrueba';
import { Avatar } from './Insignias';

interface Propiedades {
  visible: boolean;
  /** Papeleta a editar; null = nueva. */
  papeleta: Papeleta | null;
  siguienteNumero: number;
  alCerrar: () => void;
  alGuardar: (datos: DatosPapeleta) => void;
}

const VACIO: DatosPapeleta = {
  fecha: HOY,
  trabajador: { dni: '', nombre: '', cargo: '', area: '' },
  tipo: null,
  motivo: '',
  observaciones: '',
  salida: '',
  retorno: '',
};

const MOTIVOS_RAPIDOS = ['Cita médica', 'Trámites en el banco', 'Trámites personales', 'Salud de un familiar', 'Problemas con el tráfico'];

function horaActual() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function VentanaFormulario({ visible, papeleta, siguienteNumero, alCerrar, alGuardar }: Propiedades) {
  const [datos, setDatos] = useState<DatosPapeleta>(VACIO);
  const [busqueda, setBusqueda] = useState<string | Trabajador>('');
  const [sugerencias, setSugerencias] = useState<Trabajador[]>([]);
  const [intentado, setIntentado] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDatos(papeleta ? { ...papeleta } : { ...VACIO, salida: horaActual() });
    setBusqueda('');
    setIntentado(false);
  }, [visible, papeleta]);

  const cambiar = (cambios: Partial<DatosPapeleta>) => setDatos((d) => ({ ...d, ...cambios }));
  const errores = validarPapeleta(datos);
  const error = (campo: keyof DatosPapeleta) => (intentado ? errores[campo] : undefined);
  const sinRetorno = datos.retorno === null;
  const duracion = duracionMinutos(datos.salida, datos.retorno);

  const buscar = (texto: string) => {
    const q = texto.trim().toLowerCase();
    setSugerencias(TRABAJADORES.filter((t) => t.nombre.toLowerCase().includes(q) || t.dni.includes(q)).slice(0, 8));
  };

  const guardar = () => {
    setIntentado(true);
    if (Object.keys(errores).length === 0) alGuardar(datos);
  };

  const elegido = datos.trabajador.dni ? datos.trabajador : null;

  return (
    <Dialog
      visible={visible}
      onHide={alCerrar}
      header={
        <div className="pp-ventana__titulo">
          <span>{papeleta ? `Editar papeleta #${papeleta.numero}` : 'Nueva papeleta de salida'}</span>
          {!papeleta && <small>Se asignará el N° {siguienteNumero} al guardar</small>}
        </div>
      }
      className="pp-ventana"
      style={{ width: '720px' }}
      breakpoints={{ '760px': '100vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Cancelar" text onClick={alCerrar} />
          <Button label={papeleta ? 'Guardar cambios' : 'Registrar papeleta'} icon="pi pi-check" className="pp-boton-principal" onClick={guardar} />
        </div>
      }
    >
      <div className="pp-formulario">
        {/* 1. Trabajador */}
        <section className="pp-seccion">
          <h3 className="pp-seccion__titulo">
            <span>1</span> Trabajador
          </h3>
          {elegido ? (
            <div className="pp-trabajador-elegido">
              <Avatar nombre={elegido.nombre} />
              <div>
                <strong>{elegido.nombre}</strong>
                <small>
                  DNI {elegido.dni} · {elegido.cargo} · {elegido.area}
                </small>
              </div>
              {!papeleta && (
                <Button label="Cambiar" text size="small" onClick={() => cambiar({ trabajador: VACIO.trabajador })} />
              )}
            </div>
          ) : (
            <label className="pp-campo">
              <span className="pp-campo__etiqueta">Buscar por nombre o DNI *</span>
              <AutoComplete
                value={busqueda}
                suggestions={sugerencias}
                completeMethod={(e) => buscar(e.query)}
                field="nombre"
                onChange={(e) => setBusqueda(e.value)}
                onSelect={(e) => cambiar({ trabajador: e.value as Trabajador })}
                itemTemplate={(t: Trabajador) => (
                  <div className="pp-sugerencia">
                    <Avatar nombre={t.nombre} />
                    <div>
                      <strong>{t.nombre}</strong>
                      <small>
                        {t.dni} · {t.cargo}
                      </small>
                    </div>
                  </div>
                )}
                placeholder="Ej.: Quispe o 45678912"
                className={error('trabajador') ? 'p-invalid' : ''}
                inputClassName="pp-ancho-completo"
                autoFocus
              />
              <small className="pp-campo__ayuda">Cargo y área se completan solos desde la ficha del trabajador.</small>
              {error('trabajador') && <small className="pp-campo__error">{error('trabajador')}</small>}
            </label>
          )}
        </section>

        {/* 2. Permiso */}
        <section className="pp-seccion">
          <h3 className="pp-seccion__titulo">
            <span>2</span> Permiso
          </h3>
          <div className="pp-campo">
            <span className="pp-campo__etiqueta">Considerar como (opcional)</span>
            <div className="pp-opciones-tipo" role="radiogroup" aria-label="Considerar como">
              {TIPOS_PERMISO.map((t) => (
                <button
                  key={t.valor}
                  type="button"
                  role="radio"
                  aria-checked={datos.tipo === t.valor}
                  className={`pp-opcion-tipo${datos.tipo === t.valor ? ' es-activa' : ''}`}
                  // Un segundo clic quita la selección: el campo es opcional.
                  onClick={() => cambiar({ tipo: datos.tipo === t.valor ? null : t.valor })}
                >
                  <i className={t.icono} aria-hidden="true" />
                  {t.etiqueta}
                </button>
              ))}
            </div>
            <small className="pp-campo__ayuda">Déjalo sin marcar si es un permiso normal. Un segundo clic quita la selección.</small>
          </div>

          <div className="pp-rejilla-horas">
            <label className="pp-campo">
              <span className="pp-campo__etiqueta">Fecha *</span>
              <input type="date" className="p-inputtext" value={datos.fecha} onChange={(e) => cambiar({ fecha: e.target.value })} />
            </label>
            <label className="pp-campo">
              <span className="pp-campo__etiqueta">Salida *</span>
              <input
                type="time"
                className={`p-inputtext${error('salida') ? ' p-invalid' : ''}`}
                value={datos.salida}
                onChange={(e) => cambiar({ salida: e.target.value })}
              />
            </label>
            <label className="pp-campo">
              <span className="pp-campo__etiqueta">Retorno</span>
              <input
                type="time"
                className={`p-inputtext${error('retorno') ? ' p-invalid' : ''}`}
                value={datos.retorno ?? ''}
                disabled={sinRetorno}
                onChange={(e) => cambiar({ retorno: e.target.value })}
              />
            </label>
            <div className={`pp-duracion${duracion ? ' tiene-valor' : ''}`}>
              <span>Tiempo fuera</span>
              <strong>{sinRetorno ? 'Resto del día' : formatearDuracion(duracion)}</strong>
            </div>
          </div>
          <label className="pp-interruptor">
            <InputSwitch checked={sinRetorno} onChange={(e) => cambiar({ retorno: e.value ? null : '' })} />
            No retorna en el día
          </label>
          {error('retorno') && <small className="pp-campo__error">{error('retorno')}</small>}
        </section>

        {/* 3. Motivo */}
        <section className="pp-seccion">
          <h3 className="pp-seccion__titulo">
            <span>3</span> Motivo
          </h3>
          <label className="pp-campo">
            <span className="pp-campo__etiqueta pp-campo__etiqueta--contador">
              Motivo *<small>{datos.motivo.length}/{MOTIVO_MAXIMO}</small>
            </span>
            <InputTextarea
              value={datos.motivo}
              onChange={(e) => cambiar({ motivo: e.target.value })}
              rows={2}
              autoResize
              maxLength={MOTIVO_MAXIMO}
              className={error('motivo') ? 'p-invalid' : ''}
            />
            {error('motivo') && <small className="pp-campo__error">{error('motivo')}</small>}
          </label>
          <div className="pp-chips">
            {MOTIVOS_RAPIDOS.map((m) => (
              <button key={m} type="button" className="pp-chip" onClick={() => cambiar({ motivo: m })}>
                {m}
              </button>
            ))}
          </div>
          <label className="pp-campo">
            <span className="pp-campo__etiqueta pp-campo__etiqueta--contador">
              Observaciones (opcional)<small>{datos.observaciones.length}/{OBSERVACIONES_MAXIMO}</small>
            </span>
            <InputTextarea
              value={datos.observaciones}
              onChange={(e) => cambiar({ observaciones: e.target.value })}
              rows={2}
              autoResize
              maxLength={OBSERVACIONES_MAXIMO}
            />
          </label>
        </section>
      </div>
    </Dialog>
  );
}
