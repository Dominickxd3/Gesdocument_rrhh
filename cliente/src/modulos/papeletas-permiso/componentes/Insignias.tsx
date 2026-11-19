import { formatearHora, type EstadoPapeleta, type Papeleta } from '../dominio/papeleta';

const ESTADOS: Record<EstadoPapeleta, { texto: string; icono: string }> = {
  pendiente: { texto: 'Pendiente', icono: 'pi pi-clock' },
  aprobada: { texto: 'Aprobada', icono: 'pi pi-check' },
  rechazada: { texto: 'Rechazada', icono: 'pi pi-times' },
  anulada: { texto: 'Anulada', icono: 'pi pi-ban' },
};

export function InsigniaEstado({ estado }: { estado: EstadoPapeleta }) {
  const { texto, icono } = ESTADOS[estado];
  return (
    <span className={`pp-insignia es-${estado}`}>
      <i className={icono} aria-hidden="true" />
      {texto}
    </span>
  );
}

/** Salida → retorno, o aviso de que no retorna. */
export function Horario({ papeleta }: { papeleta: Papeleta }) {
  const { salida, retorno } = papeleta;
  return (
    <span className="pp-horario__horas">
      {formatearHora(salida)}
      <i className="pi pi-arrow-right" aria-hidden="true" />
      {retorno ? formatearHora(retorno) : <span className="pp-sin-retorno">No retorna</span>}
    </span>
  );
}

/** Iniciales para el avatar del trabajador. */
export function Avatar({ nombre }: { nombre: string }) {
  const [apellidos, nombres = ''] = nombre.split(',');
  const iniciales = `${nombres.trim()[0] ?? ''}${apellidos.trim()[0] ?? ''}`;
  return (
    <span className="pp-avatar" aria-hidden="true">
      {iniciales}
    </span>
  );
}
