import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import type { MenuItem } from 'primereact/menuitem';
import { useSesion, useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { obtenerIniciales } from '@/compartido/sesion/tipos';

interface PropiedadesPerfilUsuario {
  compacto: boolean;
}

/** Usuario en sesión; al hacer clic abre un menú con "Configurar" y "Cerrar sesión". */
export function PerfilUsuario({ compacto }: PropiedadesPerfilUsuario) {
  const { nombre, cargo } = useUsuarioActual();
  const { cerrarSesion } = useSesion();
  const navegar = useNavigate();
  const menu = useRef<Menu>(null);

  const opciones: MenuItem[] = [
    { label: 'Configurar', icon: 'pi pi-user-edit', command: () => navegar('/mi-cuenta') },
    { separator: true },
    { label: 'Cerrar sesión', icon: 'pi pi-sign-out', className: 'opcion-salir', command: cerrarSesion },
  ];

  return (
    <div className="perfil-usuario">
      <Menu model={opciones} popup ref={menu} className="menu-usuario" popupAlignment="left" />
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
