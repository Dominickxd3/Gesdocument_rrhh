import type { ReactNode } from 'react';
import { fechaEnTexto } from '@/compartido/formato/montos';
import { MarcaAgua } from '@/modulos/documentos/componentes/VistaDocumento';
import { PIE_DOCUMENTOS } from '@/modulos/documentos/componentes/HojasIngreso';
import '@/modulos/documentos/componentes/hojasIngreso.css';
import { PARRAFO_EXHORTO, buscarModelo, parrafoBase, parrafoPlazo, type IdModelo } from '../dominio/modelosImputacion';

/** **negrita** y __subrayado__ como en las cartas de Gestión Humana. */
function TextoConFormato({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[\s\S]+?\*\*|__[\s\S]+?__)/g).filter(Boolean);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('**') ? (
          <strong key={i}>
            <TextoConFormato texto={p.slice(2, -2)} />
          </strong>
        ) : p.startsWith('__') ? (
          <u key={i}>
            <em>
              <TextoConFormato texto={p.slice(2, -2)} />
            </em>
          </u>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

interface Propiedades {
  modelo: IdModelo;
  /** Nombre como en la ficha ("APELLIDOS, NOMBRES"). */
  trabajador: string;
  dni: string;
  area: string;
  /** Fecha de emisión (ISO). */
  fecha: string;
  hechos: string;
  plazo: number;
  /** Firma del trabajador: la registrada, el recuadro para dibujarla o el aviso de pendiente. */
  firma: ReactNode;
}

/**
 * Carta de imputación de cargos con el formato de Gestión Humana.
 * Firman la empresa (izquierda) y el trabajador (derecha).
 */
export function HojaCartaImputacion({ modelo: id, trabajador, dni, area, fecha, hechos, plazo, firma }: Propiedades) {
  const m = buscarModelo(id);
  const nombre = trabajador.replace(',', '');
  return (
    <article className="doc-hoja doc-legal ing-hoja carta-imputacion">
      <MarcaAgua />
      <div className="ing-hoja__cuerpo">
        <img className="ing-logo" src="/logo-boleta.png" alt="Grupo Pecuario" />
        <h3 className="carta-imputacion__titulo">CARTA DE IMPUTACIÓN DE CARGOS</h3>
        <p className="carta-imputacion__derecha">Lima, {fechaEnTexto(fecha)}</p>
        <p className="carta-imputacion__derecha">
          <strong>Asunto</strong>: {m.asunto}
        </p>
        <p className="carta-imputacion__destinatario">
          Señor(a)
          <br />
          <strong>{nombre}</strong>
          <br />
          <strong>Área de {area}</strong>
        </p>
        <p>De nuestra consideración:</p>
        <p>{parrafoBase(m.base)}</p>
        <p>
          <TextoConFormato texto={m.fundamento} />
        </p>
        {hechos.split(/\n\s*\n/).map((p) => (
          <p key={p}>
            <TextoConFormato texto={p} />
          </p>
        ))}
        <p>{PARRAFO_EXHORTO}</p>
        <p>{parrafoPlazo(plazo)}</p>
        <p>Atentamente,</p>
        <div className="doc-firmas carta-imputacion__firmas">
          <div className="doc-firmas__parte">
            <div className="doc-firmas__espacio" />
            <span className="doc-firmas__linea" />
            <strong>GRUPO PECUARIO S.A.C.</strong>
            <span>Gestión Humana</span>
          </div>
          <div className="doc-firmas__parte">
            <div className="doc-firmas__espacio">{firma}</div>
            <span className="doc-firmas__linea" />
            <strong>{nombre}</strong>
            <span>DNI N° {dni}</span>
          </div>
        </div>
      </div>
      <footer className="ing-pie">
        <span />
        {PIE_DOCUMENTOS}
      </footer>
    </article>
  );
}
