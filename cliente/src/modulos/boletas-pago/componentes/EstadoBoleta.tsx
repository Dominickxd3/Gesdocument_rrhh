import type { Boleta } from '../dominio/boleta';
import { formatearFecha } from '../aplicacion/formato';

type TipoEstado = 'firmada' | 'enviada' | 'pendiente';

function tipoEstado(boleta: Boleta): TipoEstado {
  if (boleta.firma === 'firmada') return 'firmada';
  return boleta.estadoEnvio === 'enviado' ? 'enviada' : 'pendiente';
}

const TEXTO_ESTADO: Record<TipoEstado, string> = {
  firmada: 'Firmada',
  enviada: 'Enviado sin firmar',
  pendiente: 'Pendiente',
};

/** Estado de la boleta: firmada, enviada sin firmar o pendiente. */
export function InsigniaEstado({ boleta }: { boleta: Boleta }) {
  const tipo = tipoEstado(boleta);
  return (
    <span
      className={`insignia-estado es-${tipo}`}
      title={boleta.fechaFirma ? `Firmada el ${formatearFecha(boleta.fechaFirma)}` : undefined}
    >
      {TEXTO_ESTADO[tipo]}
    </span>
  );
}

/** Si la boleta ya se publicó en la cuenta del colaborador. */
export function InsigniaEnvio({ boleta }: { boleta: Boleta }) {
  const enviado = boleta.estadoEnvio === 'enviado';
  return (
    <span
      className={`insignia-envio ${enviado ? 'es-enviado' : 'es-no-enviado'}`}
      title={boleta.fechaEnvio ? `Enviado el ${formatearFecha(boleta.fechaEnvio)}` : undefined}
    >
      {enviado && <i className="pi pi-check-circle" aria-hidden="true" />}
      {enviado ? 'Enviado' : 'No enviado'}
    </span>
  );
}
