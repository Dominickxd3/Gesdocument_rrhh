import { notificar } from '@/compartido/notificaciones/notificaciones';
import { useRef, useState } from 'react';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useNavigate } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import type { MenuItem } from 'primereact/menuitem';
import { useSesion, useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { obtenerIniciales } from '@/compartido/sesion/tipos';

interface PropiedadesPerfilUsuario {
  compacto: boolean;
}

/** Usuario en sesión; al hacer clic abre un menú con "Mi perfil" y "Cerrar sesión". */
export function PerfilUsuario({ compacto }: PropiedadesPerfilUsuario) {
  const { nombre, cargo } = useUsuarioActual();
  const { cerrarSesion } = useSesion();
  const navegar = useNavigate();
  const menu = useRef<Menu>(null);
  const [confirmandoSalida, setConfirmandoSalida] = useState(false);

  const opciones: MenuItem[] = [
    { label: 'Mi perfil', icon: 'pi pi-user', command: () => navegar('/mi-perfil') },
    { separator: true },
    { label: 'Cerrar sesión', icon: 'pi pi-sign-out', className: 'opcion-salir', command: () => setConfirmandoSalida(true) },
  ];

  return (
    <div className="perfil-usuario">
      <Menu model={opciones} popup ref={menu} className="menu-usuario" popupAlignment="left" />
      {/* Confirmación propia (no la global), para no duplicarse con las de otras pantallas. */}
      <ConfirmDialog
        visible={confirmandoSalida}
        onHide={() => setConfirmandoSalida(false)}
        header="Cerrar sesión"
        message="¿Quieres cerrar tu sesión? Tendrás que ingresar de nuevo con tu usuario y contraseña."
        icon="pi pi-sign-out"
        acceptLabel="Sí, cerrar sesión"
        rejectLabel="Cancelar"
        acceptClassName="boton-cerrar-sesion"
        rejectClassName="p-button-text"
        className="confirmar-salida"
        accept={() => {
          // Se sale a la pantalla de ingreso sin recordar la página actual: el siguiente usuario empieza en su Inicio.
          navegar("/iniciar-sesion", { replace: true });
          cerrarSesion();
          notificar.info("Sesión cerrada", "Hasta pronto. Ingresa de nuevo cuando lo necesites.");
        }}
      />
      <button
        type="button"
        className="perfil-usuario__boton"
        aria-haspopup="menu"
        aria-label={`Opciones de ${nombre}`}
        title={compacto ? `${nombre} · ${cargo}` : undefined}
        onClick={(evento) => menu.current?.toggle(evento)}
      >
        <Avatar label={obtenerIniciales(nombre)} shape="circle" className="perfil-usuario__avatar" />
        {!compacto && (
          <>
            <span className="perfil-usuario__datos">
              <span className="perfil-usuario__nombre">{nombre}</span>
              <span className="perfil-usuario__cargo">{cargo}</span>
            </span>
            <i className="pi pi-sort perfil-usuario__flecha" aria-hidden="true" />
          </>
        )}
      </button>
    </div>
  );
}
