const formatoMoneda = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const formatoFecha = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
const formatoFechaHora = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatearMoneda = (monto: number) => formatoMoneda.format(monto);
export const formatearFecha = (iso: string) => formatoFecha.format(new Date(iso));
export const formatearFechaHora = (iso: string) => formatoFechaHora.format(new Date(iso));

/** Número con dos decimales y separador de miles, como en la boleta PDF (ej. 1,234.50). */
const formatoNumeroBoleta = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatearNumeroBoleta = (monto: number) => formatoNumeroBoleta.format(monto);
