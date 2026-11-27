/** Trabajadores ficticios para los prototipos. Nombres, DNI, correos y teléfonos son inventados. */
import { crearAleatorio } from '@/compartido/almacen/crearAlmacen';
import type { Trabajador } from '../dominio/trabajador';
import { CUENTA_DORTIZ } from '@/modulos/autenticacion/infraestructura/cuentaDortiz';

export const AREAS = [
  'ADM ADMINISTRACIÓN',
  'ADM CONTABILIDAD',
  'ADM GESTIÓN HUMANA',
  'ADM SISTEMAS',
  'COM COMERCIAL',
  'COM DESARROLLO DE PRODUCTO',
  'COM DISTRIBUCIÓN',
  'COM LOGÍSTICA',
  'COM PRODUCCIÓN',
];

export const SEDES = ['Lima – Canto Bello', 'Lurín', 'Valle Sagrado'];

const CARGOS = ['Auxiliar de producción', 'Cortador', 'Almacenero', 'Asistente administrativo', 'Analista', 'Auxiliar de distribución', 'Vendedor'];
const NOMBRES = ['Luis', 'Ana', 'Jorge', 'Rosa', 'Miguel', 'Carmen', 'José', 'Lucía', 'Pedro', 'Elena', 'Raúl', 'Sofía', 'Diego', 'Patricia'];
const APELLIDOS = ['Quispe', 'Flores', 'Rojas', 'Mendoza', 'García', 'Huamán', 'Vargas', 'Chávez', 'Ramos', 'Torres', 'Salazar', 'Medina', 'Paredes'];

/** Jefes inmediatos ficticios, uno por área. */
export const JEFES = ['PAREDES RÍOS, CARLOS', 'MEDINA SALAS, ROCÍO', 'VARGAS LEÓN, MARTÍN', 'TORRES CANO, MARÍA'];

const sinTildes = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const CALLES = ['Jr. Los Lirios', 'Av. Próceres', 'Calle Las Gardenias', 'Jr. Los Tulipanes', 'Av. Wiesse', 'Calle Los Cedros'];
const DISTRITOS = ['San Juan de Lurigancho', 'Lurín', 'Ate', 'Santa Anita', 'El Agustino'];

/**
 * Domicilio y contrato vigente ficticios. Usan su propio generador para no cambiar
 * los nombres ya generados del resto de la ficha.
 */
const contratoAzar = crearAleatorio(1717);
function datosContrato(fechaIngreso: string, cargo: string): Pick<Trabajador, 'domicilio' | 'contrato'> {
  const { azar, elegir } = contratoAzar;
  const r = azar();
  return {
    domicilio: `${elegir(CALLES)} Mz. ${'ABCDEFGHJK'[Math.floor(azar() * 10)]} Lt. ${1 + Math.floor(azar() * 30)}, distrito de ${elegir(DISTRITOS)}, de la ciudad de Lima`,
    contrato: {
      // Reparto parecido al real: la mayoría por incremento de actividad.
      modalidad: r < 0.78 ? 'incremento_actividad' : r < 0.92 ? 'indeterminado' : 'plazo_fijo',
      fecha: fechaIngreso,
      cargo: cargo.toUpperCase(),
      remuneracion: elegir([1025, 1130, 1300, 1500, 1800, 2200, 2800]),
      clausulaRemuneracion: azar() < 0.7 ? 'sexta' : 'cuarta',
    },
  };
}

export function crearTrabajadores(): Trabajador[] {
  const { azar, elegir } = crearAleatorio(4242);
  const lista: Trabajador[] = Array.from({ length: 48 }, () => {
    const apellidos = `${elegir(APELLIDOS)} ${elegir(APELLIDOS)}`;
    const nombre = elegir(NOMBRES);
    const anio = 2015 + Math.floor(azar() * 11);
    const jefe = elegir(JEFES);
    return {
      dni: String(40000000 + Math.floor(azar() * 39999999)),
      nombre: `${apellidos}, ${nombre}`.toUpperCase(),
      area: elegir(AREAS),
      cargo: elegir(CARGOS),
      correo: `${sinTildes(nombre)}.${sinTildes(apellidos.split(' ')[0])}${Math.floor(azar() * 90 + 10)}@correo.com`,
      telefono: `9${String(Math.floor(azar() * 99999999)).padStart(8, '0').replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3')}`,
      sede: elegir(SEDES),
      fechaIngreso: `${anio}-${String(1 + Math.floor(azar() * 12)).padStart(2, '0')}-${String(1 + Math.floor(azar() * 27)).padStart(2, '0')}`,
      jefe,
      historialJefes: [{ jefe, desde: `${anio}-01-01` }],
    };
  }).map((t) => ({ ...t, ...datosContrato(t.fechaIngreso, t.cargo) }));

  // Ficha del usuario de prueba "jose" (rol trabajador); se vincula por DNI.
  lista.push({
    dni: '45871236',
    nombre: 'QUISPE ROJAS, JOSÉ',
    area: 'COM PRODUCCIÓN',
    cargo: 'Operario de producción',
    correo: 'jose.quispe@correo.com',
    telefono: '987 654 321',
    sede: 'Lima – Canto Bello',
    fechaIngreso: '2021-03-15',
    jefe: 'PAREDES RÍOS, CARLOS',
    historialJefes: [
      { jefe: 'VARGAS LEÓN, MARTÍN', desde: '2021-03-15' },
      { jefe: 'PAREDES RÍOS, CARLOS', desde: '2024-07-01' },
    ],
    domicilio: 'Jr. Las Begonias Mz. B Lt. 12, distrito de San Juan de Lurigancho, de la ciudad de Lima',
    contrato: {
      modalidad: 'incremento_actividad',
      fecha: '2021-03-15',
      cargo: 'OPERARIO DE PRODUCCIÓN',
      remuneracion: 1300,
      clausulaRemuneracion: 'sexta',
    },
  });

  // Ficha del usuario de prueba "seguridad": es un trabajador más, con cargo de Seguridad.
  lista.push({
    dni: '46213578',
    nombre: 'VIGO SALAS, PEDRO',
    area: 'ADM GESTIÓN HUMANA',
    cargo: 'Prevencionista de Seguridad',
    correo: 'pedro.vigo@correo.com',
    telefono: '956 321 478',
    sede: 'Lima – Canto Bello',
    fechaIngreso: '2019-08-01',
    jefe: 'TORRES CANO, MARÍA',
    historialJefes: [{ jefe: 'TORRES CANO, MARÍA', desde: '2019-08-01' }],
    ...datosContrato('2019-08-01', 'Prevencionista de Seguridad'),
  });

  // Ficha del usuario de prueba "dortiz" (rol trabajador).
  lista.push({
    dni: CUENTA_DORTIZ.dni,
    nombre: CUENTA_DORTIZ.nombreFicha,
    area: CUENTA_DORTIZ.area,
    cargo: CUENTA_DORTIZ.cargo,
    correo: 'dortiz@correo.com',
    telefono: '941 205 873',
    sede: 'Lima – Canto Bello',
    fechaIngreso: '2023-02-06',
    jefe: 'PAREDES RÍOS, CARLOS',
    historialJefes: [{ jefe: 'PAREDES RÍOS, CARLOS', desde: '2023-02-06' }],
    ...datosContrato('2023-02-06', CUENTA_DORTIZ.cargo),
  });

  return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
}
