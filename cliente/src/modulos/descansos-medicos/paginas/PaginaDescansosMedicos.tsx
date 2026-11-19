import { useMemo, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { esGestor } from '@/compartido/sesion/tipos';
import { useDescansos } from '../aplicacion/useDescansos';
import { aprobar, marcarVerificado, observar, rechazar, registrarAviso } from '../aplicacion/almacenDescansos';
import { AREAS } from '../infraestructura/datosPrueba';
import { diasPeriodo, type DatosAviso } from '../dominio/descanso';
import { BarraFiltros } from '../componentes/BarraFiltros';
import { TablaDescansos } from '../componentes/TablaDescansos';
import { VentanaDetalle } from '../componentes/VentanaDetalle';
import { VentanaRegistro } from '../componentes/VentanaRegistro';
import { VentanaMotivo, type TipoMotivo } from '../componentes/VentanaMotivo';
import { PaginaMisDescansos } from './PaginaMisDescansos';
// Reutiliza la base visual de papeletas (tabla, ventanas, formulario) para que ambos módulos se vean iguales.
import '../../papeletas-permiso/componentes/papeletas.css';
import '../componentes/descansos.css';

/** Misma ruta, distinta pantalla según el rol: el trabajador presenta, RR. HH. revisa. */
export function PaginaDescansosMedicos() {
  const usuario = useUsuarioActual();
  return esGestor(usuario) ? <RevisionDescansos /> : <PaginaMisDescansos />;
}

/** Vista de RR. HH. (CUS23–CUS28): revisar, verificar, observar, aprobar o rechazar. */
function RevisionDescansos() {
  const usuario = useUsuarioActual();
  const dm = useDescansos();
  const aviso = useRef<Toast>(null);
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState(false);
  const [motivo, setMotivo] = useState<TipoMotivo | null>(null);
  const firma = `${usuario.nombre} (RRHH)`;

  const detalle = useMemo(() => dm.descansos.find((d) => d.id === idDetalle) ?? null, [dm.descansos, idDetalle]);

  const avisar = (summary: string, detail?: string, severity: 'success' | 'info' = 'success') =>
    aviso.current?.show({ severity, summary, detail, life: 3200 });

  const registrar = (datos: DatosAviso) => {
    const numero = registrarAviso(datos, firma);
    setRegistrando(false);
    avisar(`Aviso N° ${numero} registrado`, 'El trabajador subirá sus sustentos desde su cuenta.');
  };

  const confirmarMotivo = (texto: string) => {
    if (!detalle || !motivo) return;
    if (motivo === 'observar') {
      observar(detalle, texto, firma);
      avisar(`Descanso N° ${detalle.numero} observado`, 'El trabajador tiene 1 día hábil para regularizar.', 'info');
    } else {
      rechazar(detalle, texto, firma);
      avisar(`Descanso N° ${detalle.numero} rechazado`, texto, 'info');
    }
    setMotivo(null);
  };

  return (
    <div className="pagina-papeletas pagina-descansos">
      <Toast ref={aviso} position="bottom-right" />

      <header className="pp-encabezado">
        <h1>Descansos médicos</h1>
        <div className="pp-encabezado__acciones">
          <Button
            label="Registrar aviso recibido"
            icon="pi pi-phone"
            outlined
            className="pp-boton-secundario"
            tooltip="Cuando el trabajador avisa por teléfono o en persona"
            tooltipOptions={{ position: 'bottom' }}
            onClick={() => setRegistrando(true)}
          />
          <Button
            label="Exportar"
            icon="pi pi-download"
            outlined
            className="pp-boton-secundario"
            onClick={() => avisar('Exportación simulada', 'En producción descargará un Excel con los filtros actuales.', 'info')}
          />
        </div>
      </header>

      <BarraFiltros filtros={dm.filtros} areas={AREAS} conteo={dm.conteo} alCambiar={dm.actualizarFiltros} />

      <TablaDescansos descansos={dm.visibles} alAbrir={(d) => setIdDetalle(d.id)} alLimpiarFiltros={dm.limpiarFiltros} />

      <VentanaDetalle
        descanso={motivo ? null : detalle}
        alCerrar={() => setIdDetalle(null)}
        alVerificar={(d) => marcarVerificado(d, firma)}
        alObservar={() => setMotivo('observar')}
        alRechazar={() => setMotivo('rechazar')}
        alAprobar={(d, reconocido) => {
          aprobar(d, reconocido, firma);
          avisar(`Descanso N° ${d.numero} aprobado`, `${diasPeriodo(reconocido.inicio, reconocido.fin)} días reconocidos.`);
        }}
      />

      <VentanaRegistro visible={registrando} modo="rrhh" alCerrar={() => setRegistrando(false)} alGuardar={registrar} />

      <VentanaMotivo tipo={motivo} alCerrar={() => setMotivo(null)} alConfirmar={confirmarMotivo} />
    </div>
  );
}
