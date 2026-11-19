import { NavLink } from 'react-router-dom';
import { Badge } from 'primereact/badge';
import type { ElementoNavegacion } from '@/compartido/navegacion/elementosNavegacion';
import { useContador } from '@/compartido/navegacion/contadores';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { rolDe } from '@/compartido/sesion/tipos';

interface PropiedadesEnlaceNavegacion {
  elemento: ElementoNavegacion;
  compacta: boolean;
  /** Subopción de un menú desplegable: se dibuja con sangría. */
  esHijo?: boolean;
}

export function EnlaceNavegacion({ elemento, compacta, esHijo = false }: PropiedadesEnlaceNavegacion) {
  const usuario = useUsuarioActual();
  const { ruta, icono } = elemento;
  const etiqueta = (rolDe(usuario) === 'trabajador' && elemento.etiquetaTrabajador) || elemento.etiqueta;
  // Pendientes reales del usuario (lo que debe atender en ese módulo).
  const pendientes = useContador(ruta, usuario);
  return (
    <NavLink
      to={ruta}
      end
      className={`enlace-navegacion${esHijo ? ' es-hijo' : ''}`}
      aria-label={compacta ? etiqueta : undefined}
      data-pr-tooltip={compacta ? etiqueta : undefined}
    >
      <i className={`${icono} enlace-navegacion__icono`} aria-hidden="true" />
      {!compacta && <span className="enlace-navegacion__etiqueta">{etiqueta}</span>}
      {!!pendientes && <Badge value={pendientes} className="enlace-navegacion__pendientes" />}
    </NavLink>
  );
}
