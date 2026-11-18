import { useEffect, useId, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ElementoNavegacion } from '@/compartido/navegacion/elementosNavegacion';
import { EnlaceNavegacion } from './EnlaceNavegacion';

interface PropiedadesMenuDesplegable {
  elemento: ElementoNavegacion & { hijos: ElementoNavegacion[] };
  compacta: boolean;
}

/**
 * Opción con subopciones. Desde otra página (o desde una subopción), el clic abre su página
 * y despliega las subopciones; estando en su página, cada clic las muestra u oculta.
 */
export function MenuDesplegable({ elemento, compacta }: PropiedadesMenuDesplegable) {
  const { pathname } = useLocation();
  const navegar = useNavigate();
  const dentroDelMenu = pathname === elemento.ruta || pathname.startsWith(`${elemento.ruta}/`);
  const [abierto, setAbierto] = useState(dentroDelMenu);
  const idSubmenu = useId();

  // Si se llega a una subopción desde otro lugar, el menú se muestra abierto.
  useEffect(() => {
    if (dentroDelMenu) setAbierto(true);
  }, [dentroDelMenu]);

  return (
    <>
      <button
        type="button"
        className={`enlace-navegacion menu-desplegable${pathname === elemento.ruta ? ' active' : dentroDelMenu ? ' es-actual' : ''}`}
        aria-expanded={abierto}
        aria-controls={idSubmenu}
        aria-label={compacta ? elemento.etiqueta : undefined}
        data-pr-tooltip={compacta ? elemento.etiqueta : undefined}
        onClick={() => {
          // En su propia página el clic muestra u oculta las subopciones;
          // desde cualquier otra (incluida una subopción) lleva a su página.
          if (pathname === elemento.ruta) {
            setAbierto(!abierto);
          } else {
            navegar(elemento.ruta);
            setAbierto(true);
          }
        }}
      >
        <i className={`${elemento.icono} enlace-navegacion__icono`} aria-hidden="true" />
        {!compacta && <span className="enlace-navegacion__etiqueta">{elemento.etiqueta}</span>}
        <i className="pi pi-chevron-down menu-desplegable__flecha" aria-hidden="true" />
      </button>
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
