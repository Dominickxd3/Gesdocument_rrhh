import { Tooltip } from 'primereact/tooltip';
import { LogoEmpresa } from '@/compartido/componentes/logo-empresa/LogoEmpresa';
import { GrupoEnlaces } from './GrupoEnlaces';
import { PerfilUsuario } from './PerfilUsuario';
import { gruposNavegacion } from '@/compartido/navegacion/elementosNavegacion';
import './barraLateral.css';

interface PropiedadesBarraLateral {
  /** Muestra solo íconos; las etiquetas aparecen como información emergente. */
  compacta?: boolean;
  /** Si se indica, el logo funciona como botón para contraer o expandir la barra. */
  alAlternarCompacta?: () => void;
}

export function BarraLateral({ compacta = false, alAlternarCompacta }: PropiedadesBarraLateral) {
  const textoAlternar = compacta ? 'Expandir menú' : 'Contraer menú';

  return (
    <div className={`barra-lateral${compacta ? ' es-compacta' : ''}`}>
      <div className="barra-lateral__logo">
        {alAlternarCompacta ? (
          <button
            type="button"
            className="barra-lateral__alternar"
            onClick={alAlternarCompacta}
            aria-expanded={!compacta}
            aria-label={textoAlternar}
            title={textoAlternar}
          >
            <LogoEmpresa compacto={compacta} />
          </button>
        ) : (
          <LogoEmpresa compacto={compacta} />
        )}
      </div>

      <nav className="barra-lateral__navegacion" aria-label="Navegación principal">
        {gruposNavegacion.map((grupo) => (
          <GrupoEnlaces key={grupo.titulo} grupo={grupo} compacta={compacta} />
        ))}
      </nav>

      <PerfilUsuario compacto={compacta} />

      {compacta && <Tooltip target=".enlace-navegacion[data-pr-tooltip]" position="right" />}
    </div>
  );
}
