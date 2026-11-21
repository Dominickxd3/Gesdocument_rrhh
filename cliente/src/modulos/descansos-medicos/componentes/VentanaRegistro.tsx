import { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import {
  PLAZO_PRESENTAR,
  SUSTENTOS,
  TIPOS_DESCANSO,
  diasPeriodo,
  fechaCorta,
  sumarDiasHabiles,
  validarAviso,
  type DatosAviso,
  type TipoSustento,
  type Trabajador,
} from '../dominio/descanso';
import { HOY, TRABAJADORES } from '../infraestructura/datosPrueba';
import { SelectorTrabajador } from '@/compartido/componentes/SelectorTrabajador';
import { guardarArchivo } from '../aplicacion/almacenDescansos';

interface Propiedades {
  visible: boolean;
  /**
   * Trabajador: avisa su propia ausencia (trabajadorFijo = su ficha) y adjunta sus sustentos.
   * RR. HH.: registra un aviso recibido por teléfono; los sustentos los sube luego el trabajador.
   */
  modo: 'trabajador' | 'rrhh';
  trabajadorFijo?: Trabajador;
  alCerrar: () => void;
  alGuardar: (datos: DatosAviso) => void;
}

const VACIO: DatosAviso = {
  trabajador: { dni: '', nombre: '', cargo: '', area: '' },
  tipo: 'enfermedad',
  inicio: HOY,
  fin: HOY,
  centroMedico: '',
  diagnostico: '',
  sustentos: {},
};

function Adjunto({ etiqueta, obligatorio, archivo, alElegir, alQuitar }: {
  etiqueta: string;
  obligatorio: boolean;
  archivo?: string;
  alElegir: (nombre: string) => void;
  alQuitar: () => void;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  return (
    <li className={archivo ? 'es-recibido' : ''}>
      <i className={archivo ? 'pi pi-check-circle' : 'pi pi-circle'} aria-hidden="true" />
      <div>
        <strong>
          {etiqueta}
          {obligatorio && <span className="dm-obligatorio"> · obligatorio para revisar</span>}
        </strong>
        <small>{archivo ?? 'PDF o imagen'}</small>
      </div>
      <input
        ref={entrada}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) alElegir(guardarArchivo(f));
          e.target.value = '';
        }}
      />
      {archivo ? (
        <Button icon="pi pi-times" text rounded size="small" aria-label="Quitar archivo" onClick={alQuitar} />
      ) : (
        <Button label="Adjuntar" icon="pi pi-upload" text size="small" onClick={() => entrada.current?.click()} />
      )}
    </li>
  );
}

/** CUS19 + CUS20: registrar el aviso de ausencia y, si ya los tiene, los sustentos. */
export function VentanaRegistro({ visible, modo, trabajadorFijo, alCerrar, alGuardar }: Propiedades) {
  const [datos, setDatos] = useState<DatosAviso>(VACIO);
  const [intentado, setIntentado] = useState(false);
  const esTrabajador = modo === 'trabajador';

  useEffect(() => {
    if (!visible) return;
    setDatos({ ...VACIO, trabajador: trabajadorFijo ?? VACIO.trabajador });
    setIntentado(false);
  }, [visible, trabajadorFijo]);

  const cambiar = (c: Partial<DatosAviso>) => setDatos((d) => ({ ...d, ...c }));
  const errores = validarAviso(datos);
  const error = (campo: keyof DatosAviso) => (intentado ? errores[campo] : undefined);
  const dias = diasPeriodo(datos.inicio, datos.fin);
  const conCertificado = !!datos.sustentos.certificado;

  const ponerSustento = (tipo: TipoSustento, nombre?: string) =>
    setDatos((d) => {
      const sustentos = { ...d.sustentos };
      if (nombre) sustentos[tipo] = nombre;
      else delete sustentos[tipo];
      return { ...d, sustentos };
    });

  const guardar = () => {
    setIntentado(true);
    if (Object.keys(errores).length === 0) alGuardar(datos);
  };

  return (
    <Dialog
      visible={visible}
      onHide={alCerrar}
      header={esTrabajador ? 'Avisar ausencia por descanso médico' : 'Registrar aviso recibido'}
      className="pp-ventana"
      style={{ width: '680px' }}
      breakpoints={{ '720px': '100vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          <Button label="Cancelar" text onClick={alCerrar} />
          <Button
            label={esTrabajador ? (conCertificado ? 'Enviar a RR. HH.' : 'Enviar aviso') : 'Registrar aviso'}
            icon="pi pi-check"
            className="pp-boton-principal"
            onClick={guardar}
          />
        </div>
      }
    >
      <div className="pp-formulario">
        {!esTrabajador && (
        <section className="pp-seccion">
          <h3 className="pp-seccion__titulo">
            <span>1</span> Trabajador que avisó
          </h3>
          <SelectorTrabajador
            etiqueta="Buscar por nombre o DNI *"
            opciones={TRABAJADORES.map((t) => ({ dni: t.dni, nombre: t.nombre, detalle: `${t.cargo} · ${t.area}` }))}
            valor={datos.trabajador.dni || null}
            alCambiar={(dni) => cambiar({ trabajador: TRABAJADORES.find((t) => t.dni === dni) ?? VACIO.trabajador })}
            error={error('trabajador')}
          />
        </section>
        )}

        <section className="pp-seccion">
          <h3 className="pp-seccion__titulo">
            <span>{esTrabajador ? 1 : 2}</span> Descanso
          </h3>
          <div className="pp-campo">
            <span className="pp-campo__etiqueta">Tipo</span>
            <div className="pp-opciones-tipo" role="radiogroup" aria-label="Tipo">
              {TIPOS_DESCANSO.map((t) => (
                <button
                  key={t.valor}
                  type="button"
                  role="radio"
                  aria-checked={datos.tipo === t.valor}
                  className={`pp-opcion-tipo${datos.tipo === t.valor ? ' es-activa' : ''}`}
                  onClick={() => cambiar({ tipo: t.valor })}
                >
                  <i className={t.icono} aria-hidden="true" />
                  {t.etiqueta}
                </button>
              ))}
            </div>
          </div>
          <div className="dm-rejilla-fechas">
            <label className="pp-campo">
              <span className="pp-campo__etiqueta">Desde *</span>
              <input type="date" className="p-inputtext" value={datos.inicio} onChange={(e) => cambiar({ inicio: e.target.value })} />
            </label>
            <label className="pp-campo">
              <span className="pp-campo__etiqueta">Hasta *</span>
              <input
                type="date"
                className={`p-inputtext${error('fin') ? ' p-invalid' : ''}`}
                value={datos.fin}
                min={datos.inicio}
                onChange={(e) => cambiar({ fin: e.target.value })}
              />
            </label>
            <div className={`pp-duracion${dias ? ' tiene-valor' : ''}`}>
              <span>Días</span>
              <strong>{dias || '—'}</strong>
            </div>
          </div>
          {error('fin') && <small className="pp-campo__error">{error('fin')}</small>}
          <label className="pp-campo">
            <span className="pp-campo__etiqueta">Centro médico</span>
            <InputText value={datos.centroMedico} onChange={(e) => cambiar({ centroMedico: e.target.value })} placeholder="Ej.: EsSalud – Policlínico Chosica" />
          </label>
          <label className="pp-campo">
            <span className="pp-campo__etiqueta">
              Diagnóstico (opcional) <span className="dm-confidencial"><i className="pi pi-lock" aria-hidden="true" /> Solo lo ve RR. HH.</span>
            </span>
            <InputText value={datos.diagnostico} onChange={(e) => cambiar({ diagnostico: e.target.value })} />
          </label>
        </section>

        {!esTrabajador ? (
          <p className="dm-aviso-plazo">
            <i className="pi pi-info-circle" aria-hidden="true" />
            El trabajador presentará los sustentos desde su cuenta. Tiene {PLAZO_PRESENTAR} días hábiles (hasta el{' '}
            {fechaCorta(sumarDiasHabiles(HOY, PLAZO_PRESENTAR))}).
          </p>
        ) : (
        <section className="pp-seccion">
          <h3 className="pp-seccion__titulo">
            <span>2</span> Sustentos
          </h3>
          <ul className="dm-sustentos">
            {SUSTENTOS.map((s) => (
              <Adjunto
                key={s.tipo}
                etiqueta={s.etiqueta}
                obligatorio={s.obligatorio}
                archivo={datos.sustentos[s.tipo]}
                alElegir={(nombre) => ponerSustento(s.tipo, nombre)}
                alQuitar={() => ponerSustento(s.tipo)}
              />
            ))}
          </ul>
          {!conCertificado && (
            <p className="dm-aviso-plazo">
              <i className="pi pi-clock" aria-hidden="true" />
              Puedes enviar el aviso ahora y subir el certificado después: tienes {PLAZO_PRESENTAR} días hábiles (hasta el{' '}
              {fechaCorta(sumarDiasHabiles(HOY, PLAZO_PRESENTAR))}).
            </p>
          )}
        </section>
        )}
      </div>
    </Dialog>
  );
}
