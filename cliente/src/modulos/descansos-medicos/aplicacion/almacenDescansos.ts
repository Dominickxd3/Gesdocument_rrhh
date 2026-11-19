import { avisarCambioContadores } from '@/compartido/navegacion/contadores';
import { useSyncExternalStore } from 'react';
import {
  PLAZO_PRESENTAR,
  PLAZO_REGULARIZAR,
  sumarDiasHabiles,
  tieneCertificado,
  type DatosAviso,
  type Descanso,
  type EventoHistorial,
  type TipoSustento,
} from '../dominio/descanso';
import { HOY, crearDescansosPrueba } from '../infraestructura/datosPrueba';

/**
 * Almacén en memoria compartido por la vista del trabajador y la de RR. HH.:
 * lo que el trabajador presenta lo ve RR. HH. al cambiar de usuario (sin recargar la página).
 * En producción se reemplaza por llamadas al servidor.
 */
let descansos: Descanso[] = crearDescansosPrueba();
const suscriptores = new Set<() => void>();

function publicar(siguiente: Descanso[]) {
  descansos = siguiente;
  suscriptores.forEach((avisar) => avisar());
  avisarCambioContadores();
}

const suscribir = (avisar: () => void) => {
  suscriptores.add(avisar);
  return () => suscriptores.delete(avisar);
};

export const useListaDescansos = () => useSyncExternalStore(suscribir, () => descansos);
export const leerDescansos = () => descansos;

const ahora = () => new Date().toISOString();

function actualizar(id: string, evento: Omit<EventoHistorial, 'fecha'>, cambios: Partial<Descanso>) {
  publicar(
    descansos.map((d) => (d.id === id ? { ...d, ...cambios, historial: [...d.historial, { ...evento, fecha: ahora() }] } : d)),
  );
}

/**
 * CUS19/CUS20: aviso de ausencia. Con certificado pasa directo a revisión;
 * sin él, el trabajador tiene 3 días hábiles para presentarlo.
 */
export function registrarAviso(datos: DatosAviso, usuario: string): number {
  const numero = Math.max(0, ...descansos.map((d) => d.numero)) + 1;
  const conCertificado = tieneCertificado(datos);
  const historial: EventoHistorial[] = [{ accion: 'aviso', usuario, fecha: ahora() }];
  if (conCertificado) historial.push({ accion: 'sustento', usuario, fecha: ahora() });
  publicar([
    {
      ...datos,
      id: `dm-${numero}`,
      numero,
      verificado: false,
      plazo: conCertificado ? null : sumarDiasHabiles(HOY, PLAZO_PRESENTAR),
      reconocido: null,
      estado: conCertificado ? 'pendiente_revision' : 'aviso',
      historial,
    },
    ...descansos,
  ]);
  return numero;
}

/** CUS20/CUS22: el trabajador presenta o regulariza sus sustentos; vuelve a revisión. */
export const presentarSustentos = (d: Descanso, nuevos: Partial<Record<TipoSustento, string>>, usuario: string) =>
  actualizar(
    d.id,
    { accion: 'sustento', usuario, nota: d.estado === 'observado' ? 'Regularizó la documentación.' : undefined },
    { sustentos: { ...d.sustentos, ...nuevos }, estado: 'pendiente_revision', plazo: null },
  );

/** CUS24: verificación de veracidad en el portal. */
export const marcarVerificado = (d: Descanso, usuario: string) =>
  actualizar(d.id, { accion: 'verificado', usuario, nota: 'Veracidad comprobada en el portal.' }, { verificado: true });

/** CUS25: solicita regularización con 1 día hábil de plazo. */
export const observar = (d: Descanso, motivo: string, usuario: string) =>
  actualizar(d.id, { accion: 'observado', usuario, nota: motivo }, { estado: 'observado', plazo: sumarDiasHabiles(HOY, PLAZO_REGULARIZAR) });

/** CUS26: aprueba con el periodo reconocido. */
export const aprobar = (d: Descanso, reconocido: { inicio: string; fin: string }, usuario: string) =>
  actualizar(d.id, { accion: 'aprobado', usuario }, { estado: 'aprobado', reconocido, plazo: null });

/** CUS27: rechaza con motivo obligatorio. */
export const rechazar = (d: Descanso, motivo: string, usuario: string) =>
  actualizar(d.id, { accion: 'rechazado', usuario, nota: motivo }, { estado: 'rechazado', plazo: null });

/** Última observación de RR. HH., para mostrársela al trabajador (CUS21). */
export const ultimaObservacion = (d: Descanso) =>
  [...d.historial].reverse().find((h) => h.accion === 'observado' || h.accion === 'rechazado')?.nota;

/**
 * Archivos subidos en esta sesión del prototipo, para poder abrirlos (nombre → URL local).
 * Los sustentos de los datos ficticios no tienen archivo real: se muestran como documento de ejemplo.
 */
const archivos = new Map<string, { url: string; tipo: string }>();

export function guardarArchivo(archivo: File): string {
  archivos.set(archivo.name, { url: URL.createObjectURL(archivo), tipo: archivo.type });
  return archivo.name;
}

export const archivoSubido = (nombre: string) => archivos.get(nombre);

/** Quién resolvió el caso y cuándo (aprobó, rechazó u observó), para mostrarlo arriba del detalle. */
export const ultimaResolucion = (d: Descanso) =>
  [...d.historial].reverse().find((h) => h.accion === 'aprobado' || h.accion === 'rechazado' || h.accion === 'observado');
