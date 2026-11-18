import type { GrupoNavegacion } from '@/compartido/navegacion/elementosNavegacion';
import { EnlaceNavegacion } from './EnlaceNavegacion';
import { MenuDesplegable } from './MenuDesplegable';

interface PropiedadesGrupoEnlaces {
  grupo: GrupoNavegacion;
  compacta: boolean;
}

export function GrupoEnlaces({ grupo, compacta }: PropiedadesGrupoEnlaces) {
  return (
    <div className="grupo-enlaces">
      {compacta ? (
        <hr className="grupo-enlaces__separador" />
      ) : (
        <h2 className="grupo-enlaces__titulo">{grupo.titulo}</h2>
      )}
      <ul>
        {grupo.elementos.map((elemento) => (
          <li key={elemento.ruta}>
            {elemento.hijos ? (
              <MenuDesplegable elemento={{ ...elemento, hijos: elemento.hijos }} compacta={compacta} />
            ) : (
              <EnlaceNavegacion elemento={elemento} compacta={compacta} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
