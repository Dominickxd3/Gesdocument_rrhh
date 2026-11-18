import { NavLink } from 'react-router-dom';
import { Badge } from 'primereact/badge';
import type { ElementoNavegacion } from '@/compartido/navegacion/elementosNavegacion';

interface PropiedadesEnlaceNavegacion {
  elemento: ElementoNavegacion;
  compacta: boolean;
  /** Subopción de un menú desplegable: se dibuja con sangría. */
  esHijo?: boolean;
}

export function EnlaceNavegacion({ elemento, compacta, esHijo = false }: PropiedadesEnlaceNavegacion) {
  const { etiqueta, ruta, icono, pendientes } = elemento;
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
