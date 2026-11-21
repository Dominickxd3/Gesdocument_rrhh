import { RouterProvider } from 'react-router-dom';
import { ProveedorSesion } from '@/compartido/sesion/ContextoSesion';
import { ServicioAutenticacionLocal } from '@/modulos/autenticacion/infraestructura/ServicioAutenticacionLocal';
import { ContenedorAvisos } from '@/compartido/notificaciones/notificaciones';
import { enrutador } from './enrutador';
// Registra los contadores de pendientes del menú.
import './pendientes';

/** Punto de composición: aquí se elige qué implementación de autenticación se usa. */
const servicioAutenticacion = new ServicioAutenticacionLocal();

export function Aplicacion() {
  return (
    <ProveedorSesion servicio={servicioAutenticacion}>
      <RouterProvider router={enrutador} />
      {/* Aviso único de la aplicación: confirma cada acción sin bloquear la pantalla. */}
      <ContenedorAvisos />
    </ProveedorSesion>
  );
}
