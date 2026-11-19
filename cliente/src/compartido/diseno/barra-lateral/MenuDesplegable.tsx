import { useEffect, useId, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { ElementoNavegacion } from '@/compartido/navegacion/elementosNavegacion';
import { EnlaceNavegacion } from './EnlaceNavegacion';

interface PropiedadesMenuDesplegable {
  elemento: ElementoNavegacion & { hijos: ElementoNavegacion[] };
  compacta: boolean;
}

/**
 * Opción con subopciones. Regla: el clic en la etiqueta solo abre su página;
 * las subopciones se muestran u ocultan únicamente con la flecha.
 * Si se entra directamente a una subopción, el menú aparece abierto para que se vea dónde se está.
 */
export function MenuDesplegable({ elemento, compacta }: PropiedadesMenuDesplegable) {
  const { pathname } = useLocation();
  const enSubopcion = pathname.startsWith(`${elemento.ruta}/`);
  const [abierto, setAbierto] = useState(enSubopcion);
  const idSubmenu = useId();

  useEffect(() => {
    if (enSubopcion) setAbierto(true);
  }, [enSubopcion]);

  return (
    <>
      <div className={`menu-desplegable${enSubopcion ? ' es-actual' : ''}`}>
        <NavLink
          to={elemento.ruta}
          end
          className="enlace-navegacion menu-desplegable__enlace"
          aria-label={compacta ? elemento.etiqueta : undefined}
          data-pr-tooltip={compacta ? elemento.etiqueta : undefined}
        >
          <i className={`${elemento.icono} enlace-navegacion__icono`} aria-hidden="true" />
          {!compacta && <span className="enlace-navegacion__etiqueta">{elemento.etiqueta}</span>}
        </NavLink>
        <button
          type="button"
          className="menu-desplegable__boton"
          aria-expanded={abierto}
          aria-controls={idSubmenu}
          aria-label={`${abierto ? 'Ocultar' : 'Mostrar'} opciones de ${elemento.etiqueta}`}
          title={`${abierto ? 'Ocultar' : 'Mostrar'} opciones`}
          onClick={() => setAbierto(!abierto)}
        >
          <i className="pi pi-chevron-down menu-desplegable__flecha" aria-hidden="true" />
        </button>
      </div>
      {abierto && (
        <ul id={idSubmenu} className="submenu">
          {elemento.hijos.map((hijo) => (
            <li key={hijo.ruta}>
              <EnlaceNavegacion elemento={hijo} compacta={compacta} esHijo />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
