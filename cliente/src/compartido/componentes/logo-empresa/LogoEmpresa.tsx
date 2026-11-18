import './logoEmpresa.css';

interface PropiedadesLogoEmpresa {
  /** Muestra solo el isotipo, sin el nombre. */
  compacto?: boolean;
}

export function LogoEmpresa({ compacto = false }: PropiedadesLogoEmpresa) {
  return (
    <div className={`logo-empresa${compacto ? ' es-compacto' : ''}`}>
      <img
        src="/isotipo-empresa.png"
        alt={compacto ? 'Gestión Documental RRHH · Grupo Pecuario' : ''}
        className="logo-empresa__isotipo"
      />
      {!compacto && (
        <div className="logo-empresa__textos">
          <span className="logo-empresa__nombre">Gestión Documental RRHH</span>
          <span className="logo-empresa__empresa">Grupo Pecuario</span>
        </div>
      )}
    </div>
  );
}
