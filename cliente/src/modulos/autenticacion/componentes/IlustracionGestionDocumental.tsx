/**
 * Ilustración del panel de inicio de sesión: un archivador con los documentos de RR. HH.
 * (boleta de pago, papeleta, descanso médico) y los íconos de los módulos alrededor.
 * Usa los colores corporativos: negro y blanco, con el rojo y el azul del logo como acentos.
 * Animada con CSS (inicioSesion.css): los documentos salen del archivador, las fichas flotan
 * y el sello de aprobado aparece. Se queda quieta si el sistema pide reducir el movimiento.
 */
const NEGRO = '#111111';
const BLANCO = '#ffffff';
const GRIS = '#d9d9d9';
const ROJO = '#d7262e';
const AZUL = '#0e4a86';

interface PropiedadesFicha {
  x: number;
  y: number;
  /** Retraso de la flotación, para que las fichas no se muevan a la vez. */
  retraso: number;
  children: React.ReactNode;
}

/** Ficha flotante con un ícono de módulo. */
function Ficha({ x, y, retraso, children }: PropiedadesFicha) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="ilu-ficha" style={{ animationDelay: `${retraso}s, ${retraso + 0.8}s` }}>
      <rect width="56" height="56" rx="14" fill={BLANCO} stroke={NEGRO} strokeWidth="2" />
      <g fill="none" stroke={NEGRO} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
      </g>
    </g>
  );
}

function LineasTexto({ x, y, anchos }: { x: number; y: number; anchos: number[] }) {
  return (
    <g>
      {anchos.map((ancho, i) => (
        <rect key={i} x={x} y={y + i * 16} width={ancho} height="6" rx="3" fill={GRIS} />
      ))}
    </g>
  );
}

export function IlustracionGestionDocumental() {
  return (
    <svg viewBox="0 0 560 520" className="ilustracion-gestion-documental" role="presentation">
      {/* Fondo */}
      <circle className="ilu-halo" cx="280" cy="270" r="210" fill={BLANCO} opacity="0.06" />
      <circle className="ilu-halo ilu-halo--2" cx="280" cy="270" r="150" fill={BLANCO} opacity="0.05" />

      {/* Parte trasera del archivador */}
      <path d="M120 170 h96 l20 22 h204 a16 16 0 0 1 16 16 v220 H120 a16 16 0 0 1 -16 -16 V186 a16 16 0 0 1 16 -16 z" fill="#3a3a3a" />

      {/* Documento: descanso médico */}
      <g className="ilu-doc ilu-doc--1">
      <g transform="rotate(-8 230 250)">
        <rect x="150" y="110" width="170" height="220" rx="10" fill={BLANCO} />
        <path className="ilu-corazon" d="M178 150 c0-10 14-14 18-4 c4-10 18-6 18 4 c0 12 -18 22 -18 22 s-18-10 -18-22z" fill={ROJO} />
        <LineasTexto x={178} y={190} anchos={[110, 90, 116, 70]} />
      </g>
      </g>

      {/* Documento: boleta de pago */}
      <g className="ilu-doc ilu-doc--2">
      <g transform="rotate(5 340 240)">
        <rect x="250" y="88" width="190" height="240" rx="10" fill={BLANCO} stroke={NEGRO} strokeWidth="2" />
        <rect x="272" y="110" width="72" height="10" rx="5" fill={AZUL} />
        <LineasTexto x={272} y={134} anchos={[146, 120]} />
        <line x1="272" y1="176" x2="418" y2="176" stroke={GRIS} strokeWidth="2" strokeDasharray="4 5" />
        <LineasTexto x={272} y={192} anchos={[90, 90, 90]} />
        <LineasTexto x={384} y={192} anchos={[34, 34, 34]} />
        <rect x="272" y="252" width="146" height="30" rx="6" fill={NEGRO} />
        <text x="284" y="272" fill={BLANCO} fontSize="13" fontWeight="700" fontFamily="inherit">S/</text>
        <rect x="352" y="262" width="54" height="8" rx="4" fill={BLANCO} />
      </g>
      </g>

      {/* Parte delantera del archivador */}
      <path d="M96 236 a16 16 0 0 1 16 -16 h352 a16 16 0 0 1 16 16 l-16 176 a16 16 0 0 1 -16 14 H128 a16 16 0 0 1 -16 -14 z" fill="#242424" stroke={BLANCO} strokeOpacity="0.4" strokeWidth="2" />
      <rect x="236" y="262" width="104" height="30" rx="8" fill={BLANCO} />
      <rect className="ilu-etiqueta" x="252" y="274" width="72" height="6" rx="3" fill={ROJO} />

      {/* Sello de aprobado */}
      <g transform="translate(430 340)">
        <g className="ilu-sello">
          <circle r="38" fill={AZUL} />
          <g transform="scale(0.82)">
            <circle className="ilu-sello__anillo" r="38" fill="none" stroke={BLANCO} strokeOpacity="0.35" strokeWidth="2" strokeDasharray="3 5" />
          </g>
          <path className="ilu-sello__check" d="M-15 1 l10 10 l20 -22" fill="none" stroke={BLANCO} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* Fichas de módulos */}
      {/* Papeletas de permiso: reloj */}
      <Ficha x={60} y={92} retraso={0}>
        <circle cx="28" cy="28" r="13" />
        <path d="M28 21 v8 l5 4" />
      </Ficha>
      {/* Trabajadores */}
      <Ficha x={456} y={70} retraso={0.6}>
        <circle cx="23" cy="23" r="6" />
        <path d="M13 40 c0-7 5-11 10-11 s10 4 10 11" />
        <circle cx="36" cy="25" r="4.5" />
        <path d="M37 32 c4 1 7 4 7 8" />
      </Ficha>
      {/* Incidencias: alerta */}
      <Ficha x={36} y={300} retraso={1.2}>
        <path d="M28 15 L42 40 H14 Z" />
        <path d="M28 25 v7 M28 36 v.5" />
      </Ficha>
      {/* Reportes: barras */}
      <Ficha x={250} y={444} retraso={1.8}>
        <path d="M16 40 H40 M20 36 V28 M28 36 V20 M36 36 V24" />
      </Ficha>

      {/* Detalles decorativos */}
      <g fill="none" stroke={BLANCO} strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round">
        <path className="ilu-brillo" d="M150 52 l8 8 M158 52 l-8 8" />
        <path className="ilu-brillo" style={{ animationDelay: '1.4s' }} d="M500 230 l8 8 M508 230 l-8 8" />
        <circle className="ilu-brillo" style={{ animationDelay: '0.7s' }} cx="96" cy="230" r="5" />
        <circle className="ilu-brillo" style={{ animationDelay: '2.1s' }} cx="396" cy="40" r="4" />
        <circle className="ilu-brillo" style={{ animationDelay: '2.8s' }} cx="520" cy="420" r="5" />
        <path className="ilu-onda" d="M40 460 q10 -10 20 0 t20 0 t20 0" />
        <path className="ilu-onda" style={{ animationDelay: '1.5s' }} d="M430 470 q10 -10 20 0 t20 0 t20 0" />
      </g>
    </svg>
  );
}
