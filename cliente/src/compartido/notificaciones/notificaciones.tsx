import { useMemo } from 'react';
import { Toast, type ToastMessage } from 'primereact/toast';
import './notificaciones.css';

/**
 * Avisos de la plataforma: un solo lugar para confirmar cada acción (guardar, enviar, firmar, aprobar…).
 * No son invasivos: aparecen en una esquina (arriba al centro en el celular), no bloquean la pantalla
 * y se cierran solos. Para acciones que no se pueden deshacer se usa además una confirmación previa.
 */

let toast: Toast | null = null;

type Tipo = 'success' | 'info' | 'warn' | 'error';

const DURACION: Record<Tipo, number> = { success: 3200, info: 3600, warn: 4500, error: 6000 };

function mostrar(mensaje: ToastMessage) {
  const tipo = (mensaje.severity ?? 'success') as Tipo;
  // La duración la fija el tipo (así coincide con la barra de tiempo), no cada pantalla.
  toast?.show({ ...mensaje, life: DURACION[tipo], severity: tipo, className: `aviso aviso--${tipo}` });
}

/** API para cualquier pantalla: notificar.exito('Papeleta firmada', 'Ya puedes mostrarla en vigilancia.'). */
export const notificar = {
  exito: (titulo: string, detalle?: string) => mostrar({ severity: 'success', summary: titulo, detail: detalle }),
  info: (titulo: string, detalle?: string) => mostrar({ severity: 'info', summary: titulo, detail: detalle }),
  aviso: (titulo: string, detalle?: string) => mostrar({ severity: 'warn', summary: titulo, detail: detalle }),
  error: (titulo: string, detalle?: string) => mostrar({ severity: 'error', summary: titulo, detail: detalle }),
};

/**
 * Compatibilidad con las pantallas que usaban su propio <Toast>: `aviso.current?.show({...})`
 * ahora pasa por el aviso único de la aplicación, con el mismo diseño en todas.
 */
export function useAviso() {
  return useMemo(() => ({ current: { show: (m: ToastMessage | ToastMessage[]) => (Array.isArray(m) ? m : [m]).forEach(mostrar) } }), []);
}

/** Se monta una sola vez en la raíz de la aplicación. */
export function ContenedorAvisos() {
  return (
    <Toast
      ref={(t) => {
        toast = t;
      }}
      position="top-right"
      className="avisos"
    />
  );
}
