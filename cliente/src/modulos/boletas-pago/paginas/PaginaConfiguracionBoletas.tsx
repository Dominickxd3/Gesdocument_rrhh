import { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { BotonVolver } from '@/compartido/componentes/BotonVolver';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { repositorioBoletas } from '../aplicacion/repositorioBoletas';
import { useConfiguracionBoletas } from '../aplicacion/useConfiguracionBoletas';
import type { Empresa } from '../dominio/boleta';
import { TarjetaFirmaActual } from '../componentes/configuracion/TarjetaFirmaActual';
import { TarjetaSubirFirma } from '../componentes/configuracion/TarjetaSubirFirma';
import { TarjetaDatosEmpresa } from '../componentes/configuracion/TarjetaDatosEmpresa';
import '../componentes/configuracion/configuracion.css';

const TAMANO_MAXIMO_FIRMA = 1024 * 1024;

function leerComoDataUrl(archivo: File): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(String(lector.result));
    lector.onerror = () => rechazar(lector.error);
    lector.readAsDataURL(archivo);
  });
}

export function PaginaConfiguracionBoletas() {
  const { configuracion, guardar } = useConfiguracionBoletas(repositorioBoletas);
  const aviso = useRef<Toast>(null);
  const [subiendo, setSubiendo] = useState(false);

  if (!configuracion) return null;

  const mostrarError = (detalle: string) =>
    aviso.current?.show({ severity: 'error', summary: 'No se pudo guardar', detail: detalle, life: 4000 });

  const subirFirma = async (archivo: File) => {
    if (archivo.type !== 'image/png') return mostrarError('La firma debe estar en formato PNG.');
    if (archivo.size > TAMANO_MAXIMO_FIRMA) return mostrarError('La imagen no debe superar 1 MB.');
    setSubiendo(true);
    try {
      await guardar({ ...configuracion, firmaEmpleador: await leerComoDataUrl(archivo) });
      aviso.current?.show({ severity: 'success', summary: 'Firma actualizada', life: 2500 });
    } catch (error) {
      mostrarError((error as Error).message);
    } finally {
      setSubiendo(false);
    }
  };

  const confirmarEliminar = () =>
    confirmDialog({
      header: 'Eliminar firma',
      message: 'Las boletas dejarán de mostrar la firma del representante legal hasta que subas una nueva.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'boton-eliminar',
      rejectClassName: 'p-button-text boton-texto',
      accept: async () => {
        await guardar({ ...configuracion, firmaEmpleador: null });
        aviso.current?.show({ severity: 'success', summary: 'Firma eliminada', life: 2500 });
      },
    });

  const guardarEmpresa = async (empresa: Empresa) => {
    try {
      await guardar({ ...configuracion, empresa });
      aviso.current?.show({ severity: 'success', summary: 'Datos de la empresa guardados', life: 2500 });
    } catch (error) {
      mostrarError((error as Error).message);
    }
  };

  return (
    <div className="pagina-configuracion">
      <Toast ref={aviso} position="bottom-right" />
      <ConfirmDialog />
      <BotonVolver destino="/boletas-pago" etiqueta="Volver a boletas" />

      <header>
        <h1>Configuración de boletas</h1>
        <p>Firma del representante legal y datos de la empresa que aparecen en la boleta</p>
      </header>

      <div className="pagina-configuracion__grilla">
        <TarjetaFirmaActual firma={configuracion.firmaEmpleador} alEliminar={confirmarEliminar} />
        <TarjetaSubirFirma cargando={subiendo} alElegir={(archivo) => void subirFirma(archivo)} />

        <section className="tarjeta-configuracion tarjeta-configuracion--ancha">
          <h2 className="tarjeta-configuracion__titulo-icono">
            <i className="pi pi-image" aria-hidden="true" />
            Recomendación
          </h2>
          <p className="tarjeta-configuracion__texto">
            La firma del representante legal se mostrará en la boleta sobre la línea de "Empleador", tanto en el
            documento como en la vista móvil. Se recomienda una imagen PNG con fondo transparente.
          </p>
        </section>

        <TarjetaDatosEmpresa empresa={configuracion.empresa} alGuardar={guardarEmpresa} />
      </div>
    </div>
  );
}
