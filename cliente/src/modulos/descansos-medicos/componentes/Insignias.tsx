import { diasParaPlazo, etiquetaEstado, type Descanso, type EstadoDescanso } from '../dominio/descanso';
import { HOY } from '../infraestructura/datosPrueba';

export function InsigniaEstado({ estado }: { estado: EstadoDescanso }) {
  return <span className={`dm-insignia es-${estado}`}>{etiquetaEstado(estado)}</span>;
}

/** Plazo del trabajador para presentar o regularizar; solo cuando se le está esperando. */
export function Plazo({ descanso }: { descanso: Descanso }) {
  const dias = diasParaPlazo(descanso, HOY);
  if (dias === null) return <span className="dm-plazo es-ninguno">—</span>;
  if (dias < 0) return <span className="dm-plazo es-vencido">Vencido</span>;
  if (dias === 0) return <span className="dm-plazo es-hoy">Vence hoy</span>;
  return <span className="dm-plazo">Vence en {dias} {dias === 1 ? 'día' : 'días'}</span>;
}

export function Avatar({ nombre }: { nombre: string }) {
  const [apellidos, nombres = ''] = nombre.split(',');
  return (
    <span className="pp-avatar" aria-hidden="true">
      {`${nombres.trim()[0] ?? ''}${apellidos.trim()[0] ?? ''}`}
    </span>
  );
}
