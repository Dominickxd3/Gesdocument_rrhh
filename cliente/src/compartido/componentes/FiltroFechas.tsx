import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';

/** Rango de fechas de los filtros (AAAA-MM-DD); null = sin límite. */
export interface RangoFechas {
  desde: string | null;
  hasta: string | null;
}

export const SIN_RANGO: RangoFechas = { desde: null, hasta: null };

addLocale('es', {
  firstDayOfWeek: 1,
  dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  today: 'Hoy',
  clear: 'Limpiar',
});

const aIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const aFecha = (iso: string) => new Date(`${iso}T12:00:00`);

/** ¿La fecha (ISO, con o sin hora) cae dentro del rango? */
export function enRango(fecha: string, r: RangoFechas): boolean {
  const dia = fecha.slice(0, 10);
  return (!r.desde || dia >= r.desde) && (!r.hasta || dia <= r.hasta);
}

/** ¿El periodo [inicio, fin] se cruza con el rango? (descansos médicos) */
export function periodoEnRango(inicio: string, fin: string, r: RangoFechas): boolean {
  return (!r.desde || fin.slice(0, 10) >= r.desde) && (!r.hasta || inicio.slice(0, 10) <= r.hasta);
}

/** Filtro "Desde – Hasta" en un solo campo, con calendario en español y botones Hoy / Limpiar. */
export function FiltroFechas({ valor, alCambiar, etiqueta = 'Desde – Hasta' }: { valor: RangoFechas; alCambiar: (r: RangoFechas) => void; etiqueta?: string }) {
  const seleccion = valor.desde ? [aFecha(valor.desde), valor.hasta ? aFecha(valor.hasta) : null] : null;
  return (
    <Calendar
      value={seleccion as (Date | null)[] | null}
      onChange={(e) => {
        const [d, h] = (e.value as (Date | null)[] | null) ?? [null, null];
        alCambiar({ desde: d ? aIso(d) : null, hasta: h ? aIso(h) : null });
      }}
      selectionMode="range"
      readOnlyInput
      locale="es"
      dateFormat="dd/mm/yy"
      placeholder={etiqueta}
      showIcon
      showButtonBar
      onClearButtonClick={() => alCambiar(SIN_RANGO)}
      hideOnRangeSelection
      aria-label={etiqueta}
      className="filtro-fechas"
    />
  );
}
