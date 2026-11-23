import { useRef, useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';
import { aDiaLocal, diaLocalDe } from '@/compartido/formato/fechas';

/** Rango de fechas de los filtros (AAAA-MM-DD); null = sin límite. */
export interface RangoFechas {
  desde: string | null;
  hasta: string | null;
}

export const SIN_RANGO: RangoFechas = { desde: null, hasta: null };

/** Filtro predeterminado de los listados: del día 1 del mes actual hasta hoy (ej.: 01/11 – 23/11). */
export function mesActualHastaHoy(): RangoFechas {
  const hoy = aDiaLocal(new Date());
  return { desde: `${hoy.slice(0, 8)}01`, hasta: hoy };
}

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

const aFecha = (iso: string) => new Date(`${iso}T12:00:00`);

/** Si solo se eligió un día, el rango es ese único día (no "desde ese día en adelante"). */
const hastaDe = (r: RangoFechas) => r.hasta ?? r.desde;

/** ¿La fecha (ISO, con o sin hora) cae dentro del rango? Se compara el día en hora local. */
export function enRango(fecha: string, r: RangoFechas): boolean {
  const dia = diaLocalDe(fecha);
  const hasta = hastaDe(r);
  return (!r.desde || dia >= r.desde) && (!hasta || dia <= hasta);
}

/** ¿El periodo [inicio, fin] se cruza con el rango? (descansos médicos) */
export function periodoEnRango(inicio: string, fin: string, r: RangoFechas): boolean {
  const hasta = hastaDe(r);
  return (!r.desde || diaLocalDe(fin) >= r.desde) && (!hasta || diaLocalDe(inicio) <= hasta);
}

/**
 * Filtro de fechas en un solo campo, con calendario en español y botones Hoy / Limpiar.
 *  - Un clic en un día filtra ese día y cierra el calendario.
 *  - Para un rango, se vuelve a abrir y se toca el día final.
 *  - No deja elegir días futuros (el límite es hoy).
 */
export function FiltroFechas({ valor, alCambiar, etiqueta = 'Desde – Hasta' }: { valor: RangoFechas; alCambiar: (r: RangoFechas) => void; etiqueta?: string }) {
  const calendario = useRef<Calendar>(null);
  const seleccion = valor.desde ? [aFecha(valor.desde), valor.hasta ? aFecha(valor.hasta) : null] : null;
  const hoy = new Date();
  // Mes que se está mirando en el calendario: al llegar al mes actual se bloquea la flecha "siguiente".
  const [vista, setVista] = useState<Date>(() => (valor.desde ? aFecha(valor.desde) : hoy));
  const enMesActual = vista.getFullYear() > hoy.getFullYear() || (vista.getFullYear() === hoy.getFullYear() && vista.getMonth() >= hoy.getMonth());
  return (
    <Calendar
      ref={calendario}
      value={seleccion as (Date | null)[] | null}
      onChange={(e) => {
        const [d, h] = (e.value as (Date | null)[] | null) ?? [null, null];
        alCambiar({ desde: d ? aDiaLocal(d) : null, hasta: h ? aDiaLocal(h) : null });
        // Primer clic: ya filtra ese día; se cierra para que se vea el resultado.
        if (d && !h) setTimeout(() => calendario.current?.hide(), 0);
      }}
      selectionMode="range"
      readOnlyInput
      locale="es"
      dateFormat="dd/mm/yy"
      maxDate={hoy}
      viewDate={vista}
      onViewDateChange={(e) => setVista(e.value)}
      panelClassName={enMesActual ? 'filtro-fechas__panel es-mes-actual' : 'filtro-fechas__panel'}
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
