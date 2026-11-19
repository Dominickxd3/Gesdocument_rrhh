/**
 * Datos ficticios para el prototipo. Nombres, DNI y motivos son inventados.
 * Se generan con semilla fija para que el diseño muestre siempre lo mismo.
 */
import type { EstadoPapeleta, Papeleta, TipoPermiso, Trabajador } from '../dominio/papeleta';

export const AREAS = [
  'ADM ADMINISTRACIÓN',
  'ADM CONTABILIDAD',
  'ADM GESTIÓN HUMANA',
  'ADM SISTEMAS',
  'COM COMERCIAL',
  'COM DESARROLLO DE PRODUCTO',
  'COM LOGÍSTICA',
  'COM PRODUCCIÓN',
];

const CARGOS = ['Auxiliar de producción', 'Cortador', 'Almacenero', 'Asistente', 'Analista', 'Supervisor', 'Vendedor'];
const NOMBRES = ['Luis', 'Ana', 'Jorge', 'Rosa', 'Miguel', 'Carmen', 'José', 'Lucía', 'Pedro', 'Elena', 'Raúl', 'Sofía', 'Diego', 'Patricia', 'Andrés', 'Valeria'];
const APELLIDOS = ['Quispe', 'Flores', 'Rojas', 'Mendoza', 'García', 'Huamán', 'Vargas', 'Chávez', 'Ramos', 'Torres', 'Salazar', 'Paredes', 'Medina', 'Silva'];

/** [considerar como, motivo]. Muchas papeletas reales no marcan condición (null). */
const MOTIVOS: [TipoPermiso | null, string][] = [
  [null, 'Trámites en el banco'],
  [null, 'Trámites personales'],
  [null, 'Cita médica en EsSalud'],
  [null, 'Salud de su hijo'],
  [null, 'Problemas con el tráfico'],
  ['comision', 'Entrega de documentos a SUNAT'],
  ['compensacion', 'Compensa horas del sábado'],
  ['medio_dia_vacaciones', 'Asuntos familiares'],
  ['otros', 'Gestión de licencia de conducir'],
];

/** Jefes inmediatos ficticios: firman el V°B° de la papeleta. */
const JEFES = ['Paredes Ríos, Carlos Alberto', 'Medina Salas, Rocío Elena', 'Vargas León, Martín José'];

const USUARIOS_RRHH = ['M. Torres (RRHH)', 'C. Ramos (RRHH)'];

function crearAleatorio(semilla: number) {
  let estado = semilla;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const azar = crearAleatorio(20261119);
const elegir = <T,>(lista: T[]) => lista[Math.floor(azar() * lista.length)];
const dosDigitos = (n: number) => String(n).padStart(2, '0');

export const TRABAJADORES: Trabajador[] = Array.from({ length: 36 }, () => ({
  dni: String(40000000 + Math.floor(azar() * 39999999)),
  nombre: `${elegir(APELLIDOS)} ${elegir(APELLIDOS)}, ${elegir(NOMBRES)}`.toUpperCase(),
  cargo: elegir(CARGOS),
  area: elegir(AREAS),
}));

/** "Hoy" del prototipo. */
export const HOY = new Date().toISOString().slice(0, 10);

function fechaHaceDias(dias: number) {
  const d = new Date(`${HOY}T12:00:00`);
  d.setDate(d.getDate() - dias);
  return d.toISOString().slice(0, 10);
}

export function crearPapeletasPrueba(): Papeleta[] {
  const lista: Papeleta[] = [];
  const total = 64;
  for (let i = 0; i < total; i++) {
    const numero = 1000 + total - i;
    const dias = Math.floor(i / 6);
    const fecha = fechaHaceDias(dias);
    const [tipo, motivo] = elegir(MOTIVOS);
    const hSalida = 7 + Math.floor(azar() * 10);
    const mSalida = elegir([0, 10, 15, 30, 45, 50]);
    const salida = `${dosDigitos(hSalida)}:${dosDigitos(mSalida)}`;
    const sinRetorno = azar() < 0.25;
    const minutosFuera = elegir([10, 15, 25, 50, 60, 90, 120]);
    const finMin = hSalida * 60 + mSalida + minutosFuera;
    const retorno = sinRetorno || finMin >= 24 * 60 ? null : `${dosDigitos(Math.floor(finMin / 60))}:${dosDigitos(finMin % 60)}`;

    let estado: EstadoPapeleta;
    if (dias === 0) estado = azar() < 0.7 ? 'pendiente' : 'aprobada';
    else if (dias === 1) estado = azar() < 0.4 ? 'pendiente' : azar() < 0.9 ? 'aprobada' : 'rechazada';
    else estado = azar() < 0.88 ? 'aprobada' : azar() < 0.6 ? 'rechazada' : 'anulada';

    const trabajador = elegir(TRABAJADORES);
    const creada = `${fecha}T${salida}:00`;
    const historial: Papeleta['historial'] = [{ accion: 'creada', usuario: elegir(JEFES), fecha: creada }];
    if (estado === 'aprobada') historial.push({ accion: 'aprobada', usuario: elegir(USUARIOS_RRHH), fecha: creada });
    if (estado === 'rechazada')
      historial.push({ accion: 'rechazada', usuario: elegir(USUARIOS_RRHH), fecha: creada, nota: 'No adjuntó sustento.' });
    if (estado === 'anulada')
      historial.push({ accion: 'anulada', usuario: elegir(USUARIOS_RRHH), fecha: creada, nota: 'Registrada por duplicado.' });

    lista.push({
      id: `pp-${numero}`,
      numero,
      fecha,
      trabajador,
      tipo,
      motivo,
      observaciones: '',
      salida,
      retorno,
      estado,
      historial,
    });
  }
  return lista;
}
