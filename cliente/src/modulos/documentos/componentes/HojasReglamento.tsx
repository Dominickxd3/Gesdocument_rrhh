import type { ReactNode } from 'react';
import { REGLAMENTO_INTERNO } from '../dominio/reglamentoInterno';
import './hojasIngreso.css';

const ES_VINETA = /^(?:[a-z]{1,2}[.)]\s|[-•]\s)/;
const ES_SUBTITULO = /^[A-ZÁÉÍÓÚÑ ]+:$/;

/** Un bloque de texto del reglamento: artículo (con "Artículo N°.-" en negrita), viñetas o subtítulo. */
function Bloque({ texto }: { texto: string }) {
  const lineas = texto.split('\n');
  if (lineas.length === 1 && ES_SUBTITULO.test(texto.trim())) return <h5 className="rit-subtitulo">{texto}</h5>;
  const [primera, ...resto] = lineas;
  const vinetas = (ES_VINETA.test(primera) ? lineas : resto).filter((l) => ES_VINETA.test(l));
  const cabeza = ES_VINETA.test(primera) ? null : primera;
  const articulo = cabeza?.match(/^(Artículo \d+°\.-)\s*(.*)$/);
  return (
    <>
      {cabeza && (
        <p>
          {articulo ? (
            <>
              <strong>{articulo[1]}</strong> {articulo[2]}
            </>
          ) : (
            cabeza
          )}
        </p>
      )}
      {vinetas.length > 0 && (
        <ul className="rit-lista">
          {vinetas.map((v) => {
            const m = v.match(/^([a-z]{1,2}[.)]|[-•])\s(.*)$/)!;
            return (
              <li key={v.slice(0, 40)}>
                <span>{m[1] === '-' ? '•' : m[1]}</span>
                {m[2]}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/**
 * Reglamento Interno de Trabajo completo (portada, capítulos y articulado), con el formato del documento
 * de Gestión Humana: marco doble, dos columnas y la marca de agua GP. Va antes del cargo de recepción.
 */
export function HojasReglamento({ marca }: { marca: ReactNode }) {
  return (
    <>
      <article className="doc-hoja doc-legal ing-hoja rit-hoja rit-portada">
        {marca}
        <div className="rit-portada__contenido">
          <img src="/logo-boleta.png" alt="Grupo Pecuario" />
          <h2>
            REGLAMENTO
            <br />
            INTERNO
            <br />
            DE
            <br />
            TRABAJO
          </h2>
          <strong>GRUPO PECUARIO S.A.C.</strong>
        </div>
      </article>
      <article className="doc-hoja doc-legal ing-hoja rit-hoja">
        {marca}
        <div className="rit-marco">
          <h3 className="rit-titulo">REGLAMENTO INTERNO DE TRABAJO DE GRUPO PECUARIO S.A.C.</h3>
          <h4 className="rit-capitulos">CAPÍTULOS</h4>
          <ol className="rit-indice">
            {REGLAMENTO_INTERNO.map((c) => (
              <li key={c.numero}>
                <span>{c.numero}.</span>
                {c.titulo}
              </li>
            ))}
          </ol>
          <div className="rit-columnas">
            {REGLAMENTO_INTERNO.map((c) => (
              <section key={c.numero} className="rit-capitulo">
                <h4>
                  CAPÍTULO {c.numero}
                  <br />
                  {c.titulo}
                </h4>
                {c.texto.split(/\n\s*\n/).map((b) => (
                  <Bloque key={b.slice(0, 60)} texto={b} />
                ))}
              </section>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}
