import { useMemo, useRef, useState } from 'react';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { esGestor } from '@/compartido/sesion/tipos';
import { PaginaMisBoletas } from './PaginaMisBoletas';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useBoletas } from '../aplicacion/useBoletas';
import { repositorioBoletas } from '../aplicacion/repositorioBoletas';
import { exportarBoletasCsv } from '../aplicacion/exportarBoletas';
import { AREAS } from '../infraestructura/datosPrueba';
import type { Boleta } from '../dominio/boleta';
import { EncabezadoBoletas } from '../componentes/EncabezadoBoletas';
import { AvisoPeriodoEnCurso } from '../componentes/AvisoPeriodoEnCurso';
import { TarjetasResumen } from '../componentes/TarjetasResumen';
import { BarraFiltros } from '../componentes/BarraFiltros';
import { TablaBoletas } from '../componentes/TablaBoletas';
import { BarraSeleccion } from '../componentes/BarraSeleccion';
import { VentanaBoleta } from '../componentes/VentanaBoleta';
import '../componentes/boletas.css';
import '../componentes/boletaDocumento.css';

const CLASES_CONFIRMACION = {
  acceptClassName: 'boton-principal',
  rejectClassName: 'p-button-text boton-texto',
  rejectLabel: 'Cancelar',
};

/** RR. HH. gestiona todas las boletas; el colaborador solo ve las suyas. */
export function PaginaBoletasPago() {
  const usuario = useUsuarioActual();
  return esGestor(usuario) ? <BoletasRrhh /> : <PaginaMisBoletas />;
}

function BoletasRrhh() {
  const boletas = useBoletas(repositorioBoletas);
  const { periodo, configuracion, todas, boletasVisibles, seleccion, enviar } = boletas;
  const aviso = useRef<Toast>(null);
  const [idDetalle, setIdDetalle] = useState<string | null>(null);

  // La ventana lee la boleta de la lista para reflejar los cambios recién hechos.
  const boletaDetalle = useMemo(() => todas.find((b) => b.id === idDetalle) ?? null, [todas, idDetalle]);
  const sinEnviar = useMemo(() => todas.filter((b) => b.estadoEnvio === 'no_enviado'), [todas]);

  const notificarEnvio = (cantidad: number) =>
    aviso.current?.show({
      severity: 'success',
      summary: cantidad === 1 ? 'Boleta enviada al colaborador' : `${cantidad} boletas enviadas`,
      detail: 'Ya está disponible en su cuenta de la plataforma.',
      life: 3500,
    });

  const enviarUna = async (boleta: Boleta) => notificarEnvio(await enviar([boleta]));

  const confirmarEnvio = (lista: Boleta[], mensaje: string) =>
    confirmDialog({
      ...CLASES_CONFIRMACION,
      header: 'Enviar boletas a los colaboradores',
      message: mensaje,
      icon: 'pi pi-send',
      acceptLabel: `Enviar ${lista.length}`,
      accept: async () => notificarEnvio(await enviar(lista)),
    });

  const confirmarRevertirFirma = (boleta: Boleta) =>
    confirmDialog({
      ...CLASES_CONFIRMACION,
      header: 'Revertir firma',
      message: `Se borrará la firma de ${boleta.trabajador}. La boleta quedará pendiente y deberá firmarla de nuevo.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, revertir',
      accept: async () => {
        await boletas.revertirFirma(boleta);
        aviso.current?.show({ severity: 'success', summary: 'Firma revertida', life: 3000 });
      },
    });

  const copiarEnlace = async (boleta: Boleta) => {
    const enlace = `${window.location.origin}/mis-boletas/${boleta.id}`;
    try {
      await navigator.clipboard.writeText(enlace);
      aviso.current?.show({ severity: 'info', summary: 'Enlace de la boleta copiado', life: 2500 });
    } catch {
      aviso.current?.show({ severity: 'warn', summary: 'No se pudo copiar', detail: enlace, life: 5000 });
    }
  };

  if (!periodo || !configuracion) return null;
  const envioMasivoBloqueado = periodo.estado === 'en_curso';

  return (
    <div className="pagina-boletas">
      <Toast ref={aviso} position="bottom-right" />
      <ConfirmDialog />

      <EncabezadoBoletas
        periodos={boletas.periodos}
        periodo={periodo}
        cargando={boletas.cargando}
        alCambiarPeriodo={(clave) => {
          setIdDetalle(null);
          boletas.cambiarPeriodo(clave);
        }}
        alRecargar={() => void boletas.recargar()}
      />

      {envioMasivoBloqueado && <AvisoPeriodoEnCurso />}

      <TarjetasResumen resumen={boletas.resumenPeriodo} />

      <BarraFiltros
        filtros={boletas.filtros}
        areas={AREAS}
        resumen={boletas.resumenFiltrado}
        pendientesEnvio={sinEnviar.length}
        envioMasivoBloqueado={envioMasivoBloqueado}
        enviando={boletas.enviando}
        alCambiar={boletas.actualizarFiltros}
        alExportar={() => exportarBoletasCsv(boletasVisibles, periodo)}
        alEnviarPendientes={() =>
          confirmarEnvio(
            sinEnviar,
            `Se publicarán ${sinEnviar.length} boletas en la cuenta de cada colaborador para que las revisen y firmen.`,
          )
        }
      />

      <TablaBoletas
        boletas={boletasVisibles}
        cargando={boletas.cargando}
        seleccion={seleccion}
        alSeleccionar={boletas.setSeleccion}
        alAbrir={(b) => setIdDetalle(b.id)}
        alEnviar={(b) => void enviarUna(b)}
        alCopiarEnlace={(b) => void copiarEnlace(b)}
        alRevertirFirma={confirmarRevertirFirma}
        alLimpiarFiltros={boletas.limpiarFiltros}
      />

      <BarraSeleccion
        cantidad={seleccion.length}
        envioMasivoBloqueado={envioMasivoBloqueado && seleccion.length > 1}
        enviando={boletas.enviando}
        alEnviar={() =>
          confirmarEnvio(seleccion, `Se publicarán ${seleccion.length} boletas en la cuenta de cada colaborador.`)
        }
        alExportar={() => exportarBoletasCsv(seleccion, periodo)}
        alQuitar={() => boletas.setSeleccion([])}
      />

      <VentanaBoleta
        boleta={boletaDetalle}
        configuracion={configuracion}
        periodo={periodo}
        enviando={boletas.enviando}
        alCerrar={() => setIdDetalle(null)}
        alEnviar={(b) => void enviarUna(b)}
        alCopiarEnlace={(b) => void copiarEnlace(b)}
        alRevertirFirma={confirmarRevertirFirma}
      />

    </div>
  );
}
