/** Montos y fechas con el formato que usan los documentos legales de la empresa. */

const UNIDADES = ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve', 'Veinte', 'Veintiún', 'Veintidós', 'Veintitrés', 'Veinticuatro', 'Veinticinco', 'Veintiséis', 'Veintisiete', 'Veintiocho', 'Veintinueve'];
const DECENAS = ['', '', '', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
const CENTENAS = ['', 'Ciento', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];

function menorQueMil(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'Cien';
  const c = Math.floor(n / 100);
  const resto = n % 100;
  let texto = CENTENAS[c];
  if (resto) {
    const parte = resto < 30 ? UNIDADES[resto] : `${DECENAS[Math.floor(resto / 10)]}${resto % 10 ? ` y ${UNIDADES[resto % 10]}` : ''}`;
    texto = texto ? `${texto} ${parte}` : parte;
  }
  return texto;
}

/** 1300 → "Un Mil Trescientos" (como en las adendas: "Un Mil", no "Mil"). */
export function enteroEnLetras(n: number): string {
  if (n === 0) return 'Cero';
  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (millones) partes.push(millones === 1 ? 'Un Millón' : `${menorQueMil(millones)} Millones`);
  if (miles) partes.push(`${menorQueMil(miles)} Mil`);
  if (resto) partes.push(menorQueMil(resto));
  return partes.join(' ');
}

const formatoMonto = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 1300 → "S/ 1,300.00 (Un Mil Trescientos con 00/100 Soles)" */
export function montoSoles(monto: number): string {
  const entero = Math.floor(monto);
  const centimos = Math.round((monto - entero) * 100);
  return `S/ ${formatoMonto.format(monto)} (${enteroEnLetras(entero)} con ${String(centimos).padStart(2, '0')}/100 Soles)`;
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const partes = (iso: string) => {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number);
  return { a, m, d };
};

/** 2021-03-15 → "15 de Marzo de 2021" */
export function fechaEnTexto(iso: string): string {
  const { a, m, d } = partes(iso);
  return `${String(d).padStart(2, '0')} de ${MESES[m - 1]} de ${a}`;
}

/** 2025-06-02 → "el 02 días del mes de Junio de 2025" (cierre de las adendas). */
export function fechaFirmaEnTexto(iso: string): string {
  const { a, m, d } = partes(iso);
  return `el ${String(d).padStart(2, '0')} días del mes de ${MESES[m - 1]} de ${a}`;
}
