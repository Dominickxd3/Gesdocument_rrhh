import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { BotonArchivo } from '@/compartido/componentes/BotonArchivo';
import { useTrabajadores } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import type { Trabajador } from '@/modulos/trabajadores/dominio/trabajador';
import { TIPOS_DOCUMENTO, type Documento, type TipoDocumento } from '../dominio/documento';

interface Propiedades {
  visible: boolean;
  dniInicial?: string;
  alCerrar: () => void;
  alCrear: (datos: Pick<Documento, 'dni' | 'trabajador' | 'tipo' | 'origen'>, enviar: boolean) => void;
}

/** CUS42 generar desde plantilla / CUS43 cargar y clasificar un documento del trabajador. */
export function VentanaNuevoDocumento({ visible, dniInicial, alCerrar, alCrear }: Propiedades) {
  const trabajadores = useTrabajadores();
  const [dni, setDni] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoDocumento>('contrato');
  const [origen, setOrigen] = useState<'plantilla' | 'archivo'>('plantilla');
  const [archivo, setArchivo] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setDni(dniInicial ?? null);
    setTipo('contrato');
    setOrigen('plantilla');
    setArchivo(null);
  }, [visible, dniInicial]);

  const trabajador = trabajadores.find((t) => t.dni === dni);
  const listo = !!trabajador && (origen === 'plantilla' || !!archivo);
  const crear = (enviar: boolean) =>
    trabajador &&
    alCrear({ dni: trabajador.dni, trabajador: trabajador.nombre, tipo, origen: origen === 'archivo' && archivo ? { tipo: 'archivo', nombre: archivo } : { tipo: 'plantilla' } }, enviar);

  return (
    <Dialog
      visible={visible}
      onHide={alCerrar}
      header="Nuevo documento"
      className="pp-ventana"
      style={{ width: '560px' }}
      breakpoints={{ '640px': '100vw' }}
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
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Trabajador *</span>
          <Dropdown
            value={dni}
            options={trabajadores}
            optionLabel="nombre"
            optionValue="dni"
            filter
            filterBy="nombre,dni"
            placeholder="Buscar por nombre o DNI"
            itemTemplate={(t: Trabajador) => (
              <span>
                {t.nombre} <small className="pp-campo__ayuda">· {t.dni}</small>
              </span>
            )}
            onChange={(e) => setDni(e.value)}
          />
        </label>
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
          {origen === 'plantilla' ? (
            <small className="pp-campo__ayuda">Se completan solos el nombre, DNI, cargo, área y fecha de ingreso del trabajador.</small>
          ) : (
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
      </div>
    </Dialog>
  );
}
