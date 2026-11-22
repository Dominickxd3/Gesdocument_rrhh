import { aDiaLocal, hoyLocal, noFuturo } from '@/compartido/formato/fechas';
/**
 * Datos ficticios para el prototipo. Nombres, DNI, diagnósticos y centros médicos son inventados.
 * Semilla fija: el diseño muestra siempre lo mismo.
 */
import { PLAZO_PRESENTAR, PLAZO_REGULARIZAR, sumarDiasHabiles, type Descanso, type EstadoDescanso, type Trabajador } from '../dominio/descanso';

export const AREAS = [
  'ADM ADMINISTRACIÓN',
  'ADM CONTABILIDAD',
  'ADM GESTIÓN HUMANA',
  'COM DESARROLLO DE PRODUCTO',
  'COM DISTRIBUCIÓN',
  'COM LOGÍSTICA',
  'COM PRODUCCIÓN',
];

const CARGOS = ['Operario', 'Cortador', 'Almacenero', 'Asistente', 'Chofer', 'Supervisor'];
const NOMBRES = ['Luis', 'Ana', 'Jorge', 'Rosa', 'Miguel', 'Carmen', 'José', 'Lucía', 'Pedro', 'Elena', 'Raúl', 'Sofía'];
const APELLIDOS = ['Quispe', 'Flores', 'Rojas', 'Mendoza', 'García', 'Huamán', 'Vargas', 'Chávez', 'Ramos', 'Torres', 'Salazar', 'Medina'];
const CENTROS = ['EsSalud – Policlínico Chosica', 'Clínica San Juan', 'Hospital Nacional Hipólito Unanue', 'Centro de Salud Canto Grande'];
const DIAGNOSTICOS = ['Faringitis aguda', 'Gastroenteritis', 'Lumbalgia', 'Esguince de tobillo', 'Infección respiratoria'];
const RRHH = ['M. Torres (RRHH)', 'C. Ramos (RRHH)'];

function crearAleatorio(semilla: number) {
  let estado = semilla;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const azar = crearAleatorio(1913);
const elegir = <T,>(lista: T[]) => lista[Math.floor(azar() * lista.length)];

export const TRABAJADORES: Trabajador[] = Array.from({ length: 30 }, () => ({
  dni: String(40000000 + Math.floor(azar() * 39999999)),
  nombre: `${elegir(APELLIDOS)} ${elegir(APELLIDOS)}, ${elegir(NOMBRES)}`.toUpperCase(),
  cargo: elegir(CARGOS),
  area: elegir(AREAS),
}));

/** Ficha del usuario de prueba "jose.quispe" (rol trabajador); se vincula por DNI. */
export const TRABAJADOR_DEMO: Trabajador = {
  dni: '45871236',
  nombre: 'QUISPE ROJAS, JOSÉ',
  cargo: 'Operario de producción',
  area: 'COM PRODUCCIÓN',
};
TRABAJADORES.push(TRABAJADOR_DEMO);

/** Ficha del usuario de prueba "seguridad": también es trabajador y registra sus descansos. */
export const TRABAJADOR_SEGURIDAD: Trabajador = {
  dni: '46213578',
  nombre: 'VIGO SALAS, PEDRO',
  cargo: 'Prevencionista de Seguridad',
  area: 'ADM GESTIÓN HUMANA',
};
TRABAJADORES.push(TRABAJADOR_SEGURIDAD);

/** Casos del trabajador de prueba: uno observado y dos cerrados, para que vea cada situación. */
const CASOS_DEMO = [7, 12, 21];
/** Casos del usuario de Seguridad. */
const CASOS_SEGURIDAD = [3, 16];

export const HOY = hoyLocal();

function haceDias(dias: number) {
  const d = new Date(`${HOY}T12:00:00`);
  d.setDate(d.getDate() - dias);
  return aDiaLocal(d);
}

function masDias(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return aDiaLocal(d);
}

/** Los casos recientes muestran todos los estados abiertos; los antiguos ya están cerrados. */
const RECIENTES: EstadoDescanso[] = [
  'aviso',
  'pendiente_revision',
  'pendiente_revision',
  'observado',
  'aviso',
  'pendiente_revision',
  'aprobado',
  'observado',
  'pendiente_revision',
];

function estadoPara(indice: number): EstadoDescanso {
  return RECIENTES[indice] ?? (azar() < 0.85 ? 'aprobado' : 'rechazado');
}

export function crearDescansosPrueba(): Descanso[] {
  // 26 del último mes (con casos por revisar) y el histórico de unos 6 meses, ya resuelto.
  return Array.from({ length: 64 }, (_, i) => {
    const numero = 300 - i;
    const dias = i < 26 ? Math.floor(i * 1.2) : 31 + Math.floor((i - 26) * 4);
    const inicio = haceDias(dias);
    const fin = masDias(inicio, elegir([0, 1, 2, 2, 3, 6]));
    const estado = estadoPara(i);
    const tipo = azar() < 0.8 ? 'enfermedad' : 'accidente';
    const conCertificado = estado !== 'aviso' && estado !== 'observado';
    const historial: Descanso['historial'] = [{ accion: 'aviso', usuario: 'Trabajador', fecha: `${inicio}T08:10:00` }];
    let plazo: string | null = null;

    if (estado === 'aviso') plazo = sumarDiasHabiles(inicio, PLAZO_PRESENTAR);
    if (estado === 'observado') {
      historial.push({ accion: 'sustento', usuario: 'Trabajador', fecha: `${masDias(inicio, 1)}T10:00:00` });
      historial.push({
        accion: 'observado',
        usuario: elegir(RRHH),
        fecha: `${masDias(inicio, 1)}T15:30:00`,
        nota: 'El certificado no tiene firma ni sello del médico.',
      });
      plazo = sumarDiasHabiles(masDias(inicio, 1), PLAZO_REGULARIZAR);
    }
    if (estado === 'pendiente_revision' || estado === 'aprobado' || estado === 'rechazado')
      historial.push({ accion: 'sustento', usuario: 'Trabajador', fecha: `${masDias(inicio, 1)}T09:20:00` });
    if (estado === 'aprobado') {
      historial.push({ accion: 'verificado', usuario: elegir(RRHH), fecha: `${masDias(inicio, 2)}T11:00:00` });
      historial.push({ accion: 'aprobado', usuario: elegir(RRHH), fecha: `${masDias(inicio, 2)}T11:05:00` });
    }
    if (estado === 'rechazado')
      historial.push({
        accion: 'rechazado',
        usuario: elegir(RRHH),
        fecha: `${masDias(inicio, 2)}T12:00:00`,
        nota: 'No se pudo verificar el certificado en el portal.',
      });

    const aleatorio = elegir(TRABAJADORES);
    const trabajador = CASOS_DEMO.includes(i) ? TRABAJADOR_DEMO : CASOS_SEGURIDAD.includes(i) ? TRABAJADOR_SEGURIDAD : aleatorio;
    // El aviso y los sustentos los registra el propio trabajador: se muestra su nombre.
    const nombreCorto = trabajador.nombre.split(',').reverse().join(' ').trim();
    for (const h of historial) if (h.usuario === 'Trabajador') h.usuario = nombreCorto;
    // Si el descanso empezó hoy o ayer, sus eventos no pueden figurar en días que aún no llegan.
    for (const h of historial) h.fecha = noFuturo(h.fecha);

    return {
      id: `dm-${numero}`,
      numero,
      trabajador,
      tipo,
      inicio,
      fin,
      centroMedico: elegir(CENTROS),
      diagnostico: elegir(DIAGNOSTICOS),
      sustentos: conCertificado
        ? { certificado: `certificado_${numero}.pdf`, ...(azar() < 0.6 ? { constancia: `constancia_${numero}.pdf` } : {}) }
        : estado === 'observado'
          ? { constancia: `constancia_${numero}.pdf` }
          : {},
      verificado: estado === 'aprobado',
      plazo,
      reconocido: estado === 'aprobado' ? { inicio, fin } : null,
      estado,
      historial,
    } satisfies Descanso;
  });
}
