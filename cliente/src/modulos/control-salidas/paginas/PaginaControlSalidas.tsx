import { useAviso } from '@/compartido/notificaciones/notificaciones';
import { useMemo, useState } from 'react';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { TablaListado, CeldaPersona } from '@/compartido/componentes/TablaListado';
import { Insignia } from '@/compartido/componentes/Insignia';
import { hoyLocal } from '@/compartido/formato/fechas';
import { fechaLarga } from '@/compartido/almacen/crearAlmacen';
import '@/compartido/estilos/listados';
import { nombreLegible } from '@/modulos/trabajadores/dominio/trabajador';
import { SEDES } from '@/modulos/trabajadores/infraestructura/datosTrabajadores';
import { formatearHora, type Papeleta, numeroPapeleta } from '@/modulos/papeletas-permiso/dominio/papeleta';
import { registrarSalida, usePapeletasCompartidas } from '@/modulos/papeletas-permiso/aplicacion/almacenPapeletas';
import { autorizacionDe, papeletasAutorizadas } from '../aplicacion/controlSalidas';
import { VentanaRegistroSalida } from '../componentes/VentanaRegistroSalida';
import './controlSalidas.css';

/** Seguridad (RF12, CUS17–CUS18): papeletas autorizadas por RR. HH. de su sede, y registro de salida. */
export function PaginaControlSalidas() {
  const usuario = useUsuarioActual();
  const papeletas = usePapeletasCompartidas();
  const aviso = useAviso();
  const [fecha, setFecha] = useState(hoyLocal);
  const [sede, setSede] = useState<string | null>(usuario.sede ?? SEDES[0]);
  const [busqueda, setBusqueda] = useState('');
  const [idAbierta, setIdAbierta] = useState<string | null>(null);

  const autorizadas = useMemo(() => papeletasAutorizadas(papeletas, fecha, sede, busqueda), [papeletas, fecha, sede, busqueda]);
  const registradas = autorizadas.filter((p) => p.controlSalida).length;
  const abierta = papeletas.find((p) => p.id === idAbierta) ?? null;

  const celdaControl = (p: Papeleta) =>
    p.controlSalida ? (
      <Insignia tono="verde">Salió {formatearHora(p.controlSalida.hora)}</Insignia>
    ) : (
      <Insignia tono="ambar">Por registrar</Insignia>
    );

  const celdaAccion = (p: Papeleta) => (
    <Button
      label={p.controlSalida ? 'Ver' : 'Registrar salida'}
      icon={p.controlSalida ? 'pi pi-eye' : 'pi pi-sign-out'}
      size="small"
      tooltip={p.controlSalida ? 'Ver registro' : 'Registrar salida'}
      tooltipOptions={{ position: 'left' }}
      outlined={!!p.controlSalida}
      className={p.controlSalida ? 'pp-boton-secundario' : 'pp-boton-principal'}
      onClick={(e) => {
        e.stopPropagation();
        setIdAbierta(p.id);
      }}
    />
  );

  return (
    <div className="pagina-papeletas">
      <header className="pp-encabezado">
        <div>
          <h1>Control de salidas</h1>
          <p className="cs-subtitulo">Papeletas autorizadas por RR. HH. · {fechaLarga(fecha)}</p>
        </div>
      </header>

      <div className="cs-resumen" aria-label="Resumen del día">
        <div>
          <span>Autorizadas</span>
          <strong>{autorizadas.length}</strong>
        </div>
        <div>
          <span>Salidas registradas</span>
          <strong>{registradas}</strong>
        </div>
        <div className={autorizadas.length - registradas > 0 ? 'es-pendiente' : ''}>
          <span>Por registrar</span>
          <strong>{autorizadas.length - registradas}</strong>
        </div>
      </div>

      <div className="pp-filtros__fila">
        <IconField iconPosition="left" className="pp-filtros__busqueda">
          <InputIcon className="pi pi-search" />
          <InputText value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por N°, nombre o DNI" aria-label="Buscar" />
        </IconField>
        <Dropdown value={sede} options={SEDES} onChange={(e) => setSede(e.value ?? null)} placeholder="Todas las sedes" showClear className="pp-filtros__area" aria-label="Sede" />
        <input
          type="date"
          className="p-inputtext cs-fecha"
          value={fecha}
          max={hoyLocal()}
          onChange={(e) => setFecha(e.target.value || hoyLocal())}
          aria-label="Fecha"
        />
        {fecha !== hoyLocal() && <Button label="Hoy" text className="pp-boton-texto" onClick={() => setFecha(hoyLocal())} />}
      </div>

      <TablaListado
        datos={autorizadas}
        clave="id"
        nombrePlural="papeletas autorizadas"
        vacio="No hay papeletas autorizadas para esta sede y fecha."
        alAbrir={(p) => setIdAbierta(p.id)}
        claseFila={(p) => (p.controlSalida ? 'cs-fila es-registrada' : 'cs-fila')}
      >
        <Column header="N°" body={(p: Papeleta) => <strong>{numeroPapeleta(p.numero)}</strong>} className="pp-col-fecha" />
        <Column header="Trabajador" body={(p: Papeleta) => <CeldaPersona nombre={p.trabajador.nombre} detalle={`DNI ${p.trabajador.dni}`} />} />
        <Column header="Área" body={(p: Papeleta) => p.trabajador.area} className="col-area tr-col-gris" headerClassName="col-area" />
        <Column header="Salida" body={(p: Papeleta) => <strong>{formatearHora(p.salida)}</strong>} />
        <Column header="Retorno" body={(p: Papeleta) => (p.retorno ? formatearHora(p.retorno) : 'No retorna')} className="tr-col-gris" />
        <Column header="Autorizó" body={(p: Papeleta) => autorizacionDe(p)?.usuario ?? 'RR. HH.'} className="tr-col-gris" />
        <Column header="Control" body={celdaControl} />
        <Column body={celdaAccion} className="cs-col-accion" />
      </TablaListado>

      <VentanaRegistroSalida
        papeleta={abierta}
        alCerrar={() => setIdAbierta(null)}
        alRegistrar={(p, hora, nota) => {
          registrarSalida(p.id, hora, nombreLegible(usuario.nombre), nota);
          setIdAbierta(null);
          aviso.current?.show({ severity: 'success', summary: `Salida registrada · Papeleta N° ${numeroPapeleta(p.numero)}`, life: 3000 });
        }}
      />
    </div>
  );
}
