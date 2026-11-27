import { ahoraIso, crearAleatorio, crearAlmacen, fechaLarga, haceDias } from '@/compartido/almacen/crearAlmacen';
import { almacenTrabajadores } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { nombreLegible } from '@/modulos/trabajadores/dominio/trabajador';
import { JEFES } from '@/modulos/trabajadores/infraestructura/datosTrabajadores';
import { type Actuacion, type EstadoIncidencia, type Incidencia } from '../dominio/incidencia';
import { MODELOS_IMPUTACION, buscarModelo, hechosDeModelo, type IdModelo } from '../dominio/modelosImputacion';

/** Lo que reporta el jefe en cada tipo de falta (una incidencia de ejemplo por modelo, sin repetir). */
const DESCRIPCION: Partial<Record<IdModelo, string>> = {
  tardanza: 'Registró su ingreso 15 minutos después de su horario sin aviso previo.',
  falta_injustificada: 'No se presentó a laborar ni comunicó el motivo.',
  abandono: 'Se retiró antes de su horario sin autorización.',
  cobranza: 'No entregó en bóveda el efectivo de la cobranza del día.',
  bpm: 'Se le encontró en sala de proceso sin toca ni mascarilla.',
  alcohol: 'El alcoholímetro de vigilancia arrojó resultado positivo al ingreso.',
  celular_proceso: 'Ingresó a la sala de proceso con su celular personal.',
  convivencia: 'Un compañero reportó una discusión en tono agresivo.',
};

function crearIncidencias(): Incidencia[] {
  const { elegir } = crearAleatorio(919);
  const trabajadores = almacenTrabajadores.leer().lista;
  const demo = trabajadores.find((t) => t.dni === '45871236')!;
  const estados: EstadoIncidencia[] = ['registrada', 'en_investigacion', 'memo_emitido', 'cerrada', 'memo_firmado', 'en_investigacion', 'memo_firmado', 'cerrada'];

  return Array.from({ length: MODELOS_IMPUTACION.length }, (_, i) => {
    const t = i === 2 ? demo : elegir(trabajadores);
    const estado = estados[i % estados.length];
    const modelo = MODELOS_IMPUTACION[i % MODELOS_IMPUTACION.length];
    const asunto = modelo.nombre;
    const descripcion = DESCRIPCION[modelo.id] ?? `Se reporta: ${modelo.nombre.toLowerCase()}.`;
    const dias = i * 2 + 1;
    const fecha = haceDias(dias, '10:00').slice(0, 10);
    const jefe = elegir(JEFES);
    const actuaciones: Actuacion[] = [{ tipo: 'registro', usuario: nombreLegible(jefe), fecha: haceDias(dias, '10:30'), texto: descripcion }];
    let memorandum: Incidencia['memorandum'] = null;

    if (estado !== 'registrada') {
      actuaciones.push({ tipo: 'explicacion', usuario: 'María Torres', fecha: haceDias(dias - 1, '11:00'), texto: 'El trabajador indicó que no conocía el procedimiento actualizado.' });
    }
    if (estado === 'cerrada') {
      actuaciones.push({ tipo: 'cierre', usuario: 'Carlos Ramírez', fecha: haceDias(dias - 1, '16:00'), texto: 'Primera falta y explicación justificada; se cierra con orientación verbal.' });
    }
    if (estado === 'memo_emitido' || estado === 'memo_firmado') {
      memorandum = { modelo: modelo.id, texto: hechosDeModelo(modelo, fechaLarga(fecha)), plazo: modelo.plazo, emitido: haceDias(dias - 1, '17:00') };
      actuaciones.push({ tipo: 'conclusion', usuario: 'Carlos Ramírez', fecha: haceDias(dias - 1, '16:30'), texto: 'Se confirma la falta según las evidencias.' });
      actuaciones.push({ tipo: 'memo', usuario: 'Carlos Ramírez', fecha: memorandum.emitido, texto: modelo.asunto });
    }
    if (estado === 'memo_firmado') actuaciones.push({ tipo: 'firma', usuario: nombreLegible(t.nombre), fecha: haceDias(Math.max(0, dias - 2), '09:00') });

    return {
      id: `inc-${120 - i}`,
      numero: 120 - i,
      dni: t.dni,
      trabajador: t.nombre,
      fecha,
      asunto,
      descripcion,
      reportadoPor: jefe,
      evidencias: i % 3 === 0 ? [] : [`evidencia_${120 - i}.jpg`],
      estado,
      memorandum,
      actuaciones,
    };
  });
}

export const almacenIncidencias = crearAlmacen(crearIncidencias);
export const useIncidencias = () => almacenIncidencias.usar();

function actualizar(id: string, actuacion: Omit<Actuacion, 'fecha'>, cambios: Partial<Incidencia> = {}) {
  almacenIncidencias.escribir((lista) =>
    lista.map((i) => (i.id === id ? { ...i, ...cambios, actuaciones: [...i.actuaciones, { ...actuacion, fecha: ahoraIso() }] } : i)),
  );
}

/** CUS29: registrar incidencia con evidencias (jefe inmediato o RR. HH.). */
export function registrarIncidencia(datos: Pick<Incidencia, 'dni' | 'trabajador' | 'fecha' | 'asunto' | 'descripcion' | 'evidencias'>, usuario: string) {
  const lista = almacenIncidencias.leer();
  const numero = Math.max(0, ...lista.map((i) => i.numero)) + 1;
  almacenIncidencias.escribir([
    {
      ...datos,
      id: `inc-${numero}`,
      numero,
      reportadoPor: usuario,
      estado: 'registrada',
      memorandum: null,
      actuaciones: [{ tipo: 'registro', usuario, fecha: ahoraIso(), texto: datos.descripcion }],
    },
    ...lista,
  ]);
  return numero;
}

/** CUS31: explicación del trabajador u otra actuación; pasa a investigación. */
export const registrarActuacion = (i: Incidencia, tipo: 'explicacion' | 'actuacion', texto: string, usuario: string) =>
  actualizar(i.id, { tipo, usuario, texto }, { estado: 'en_investigacion' });

/** CUS32 + CUS33: conclusión y cierre sin memorándum. */
export const cerrarSinMemorandum = (i: Incidencia, conclusion: string, usuario: string) =>
  actualizar(i.id, { tipo: 'cierre', usuario, texto: conclusion }, { estado: 'cerrada' });

/** CUS34 + CUS35: generar desde plantilla, revisar y emitir el memorándum. */
export const emitirMemorandum = (i: Incidencia, modelo: IdModelo, texto: string, plazo: number, usuario: string) =>
  actualizar(i.id, { tipo: 'memo', usuario, texto: buscarModelo(modelo).asunto }, { estado: 'memo_emitido', memorandum: { modelo, texto, plazo, emitido: ahoraIso() } });

/** CUS36 + CUS37: el trabajador confirma la recepción y firma. */
/** El trabajador dibuja su firma para dejar constancia de que recibió el memorándum. */
export const firmarRecepcion = (i: Incidencia, usuario: string, firmaImagen: string) =>
  actualizar(i.id, { tipo: 'firma', usuario, firmaImagen }, { estado: 'memo_firmado' });
