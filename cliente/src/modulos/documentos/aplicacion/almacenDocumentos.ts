import { ahoraIso, crearAleatorio, crearAlmacen, haceDias } from '@/compartido/almacen/crearAlmacen';
import { almacenTrabajadores } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { nombreLegible, type Trabajador } from '@/modulos/trabajadores/dominio/trabajador';
import { clausulasSugeridas, esCargoVentas, type DatosAdenda } from '../dominio/plantillaAdenda';
import { calcularHasta, esCargoConfianza, funcionesSugeridas, type DatosContrato } from '../dominio/plantillaContrato';
import { TIPOS_DOCUMENTO, type Documento, type EstadoDocumento, type EventoDocumento } from '../dominio/documento';

const RRHH = ['María Torres', 'Carlos Ramírez'];

/** Documentos ficticios repartidos entre los trabajadores (incluye al usuario de prueba jose.quispe). */
function crearDocumentos(): Documento[] {
  const { azar, elegir } = crearAleatorio(777);
  const trabajadores = almacenTrabajadores.leer().lista;
  const demo = trabajadores.find((t) => t.dni === '45871236')!;
  const estados: EstadoDocumento[] = ['pendiente_firma', 'firmado', 'firmado', 'observado', 'preparacion', 'firmado', 'pendiente_firma'];

  return Array.from({ length: 40 }, (_, i) => {
    const t = i < 3 ? demo : elegir(trabajadores);
    const estado: EstadoDocumento = i === 0 ? 'pendiente_firma' : i === 1 ? 'firmado' : i === 2 ? 'pendiente_firma' : elegir(estados);
    // N° 497 es un contrato de vendedor de ejemplo: lleva la adenda de obligaciones como segunda página.
    const tipo = i === 0 ? 'adenda' : i === 1 || i === 3 ? 'contrato' : i === 2 ? 'reglamento' : elegir(TIPOS_DOCUMENTO).valor;
    const dias = Math.floor(i * 0.9) + 1;
    const rrhh = elegir(RRHH);
    const historial: EventoDocumento[] = [{ accion: 'creado', usuario: rrhh, fecha: haceDias(dias, '09:15') }];
    let version = 1;
    if (estado !== 'preparacion') historial.push({ accion: 'enviado', usuario: rrhh, fecha: haceDias(dias, '09:30') });
    if (estado === 'observado' || (estado === 'firmado' && azar() < 0.2)) {
      historial.push({ accion: 'observado', usuario: nombreLegible(t.nombre), fecha: haceDias(dias, '15:10'), nota: 'Mi segundo apellido está mal escrito.' });
      if (estado === 'firmado') {
        version = 2;
        historial.push({ accion: 'corregido', usuario: rrhh, fecha: haceDias(dias - 1, '10:00') });
      }
    }
    if (estado === 'firmado') historial.push({ accion: 'firmado', usuario: nombreLegible(t.nombre), fecha: haceDias(Math.max(0, dias - 1), '16:40') });

    return {
      id: `doc-${500 - i}`,
      numero: 500 - i,
      dni: t.dni,
      trabajador: t.nombre,
      tipo,
      version,
      origen: { tipo: 'plantilla' },
      estado,
      historial,
      // Las adendas ficticias se arman como las reales: cambio de cargo y de remuneración.
      adenda: tipo === 'adenda' ? adendaEjemplo(t, haceDias(dias).slice(0, 10), i) : undefined,
      contrato: tipo === 'contrato' ? contratoEjemplo(t, haceDias(dias).slice(0, 10), i === 3 ? 'VENDEDOR DE CAMPO' : undefined) : undefined,
    };
  });
}

const CARGOS_NUEVOS = ['AUXILIAR DE COBRANZAS', 'VENDEDOR MULTIFUNCIONAL', 'SUPERVISOR DE PRODUCCIÓN', 'ASISTENTE DE ALMACÉN'];

function adendaEjemplo(t: Trabajador, fechaFirma: string, i: number): DatosAdenda {
  const cargoNuevo = CARGOS_NUEVOS[i % CARGOS_NUEVOS.length];
  return datosAdenda(t, { cargoNuevo, remuneracionNueva: t.contrato.remuneracion + 200, especiales: clausulasSugeridas(cargoNuevo), fechaFirma });
}

function contratoEjemplo(t: Trabajador, desde: string, cargoForzado?: string): DatosContrato {
  const cargo = cargoForzado ?? t.contrato.cargo;
  return datosContrato(t, {
    cargo,
    confianza: esCargoConfianza(cargo),
    meses: 3,
    desde,
    hasta: calcularHasta(desde, 3),
    remuneracion: t.contrato.remuneracion,
    asignacionFamiliar: true,
    horario1: 'de Lunes a Viernes de 7:00 a.m. a 4:00 p.m.',
    horario2: 'Sábados de 7:00 a.m. a 4:00 p.m.',
    funciones: funcionesSugeridas(cargo),
    adendaVendedor: esCargoVentas(cargo),
  });
}

/** Completa el contrato con la copia de los datos del trabajador (nombre, DNI, domicilio). */
export function datosContrato(t: Trabajador, datos: Omit<DatosContrato, 'trabajador'>): DatosContrato {
  return { ...datos, trabajador: { nombre: t.nombre, dni: t.dni, domicilio: t.domicilio } };
}

/** Completa la adenda con la copia de la ficha y del contrato vigente del trabajador. */
export function datosAdenda(t: Trabajador, cambios: Pick<DatosAdenda, 'cargoNuevo' | 'remuneracionNueva' | 'especiales' | 'fechaFirma'>): DatosAdenda {
  return { ...cambios, trabajador: { nombre: t.nombre, dni: t.dni, domicilio: t.domicilio }, contrato: { ...t.contrato } };
}

export const almacenDocumentos = crearAlmacen(crearDocumentos);
export const useDocumentos = () => almacenDocumentos.usar();

function actualizar(id: string, evento: Omit<EventoDocumento, 'fecha'>, cambios: (d: Documento) => Partial<Documento>) {
  almacenDocumentos.escribir((lista) =>
    lista.map((d) => (d.id === id ? { ...d, ...cambios(d), historial: [...d.historial, { ...evento, fecha: ahoraIso() }] } : d)),
  );
}

/** CUS42/CUS43: generar desde plantilla o cargar un archivo. Queda en preparación. */
export function crearDocumento(datos: Pick<Documento, 'dni' | 'trabajador' | 'tipo' | 'origen' | 'adenda' | 'contrato'>, usuario: string, enviar: boolean): number {
  const lista = almacenDocumentos.leer();
  const numero = Math.max(0, ...lista.map((d) => d.numero)) + 1;
  const historial: EventoDocumento[] = [{ accion: 'creado', usuario, fecha: ahoraIso() }];
  if (enviar) historial.push({ accion: 'enviado', usuario, fecha: ahoraIso() });
  almacenDocumentos.escribir([{ ...datos, id: `doc-${numero}`, numero, version: 1, estado: enviar ? 'pendiente_firma' : 'preparacion', historial }, ...lista]);
  return numero;
}

/** CUS44: enviar para revisión y firma del trabajador. */
export const enviarAFirma = (d: Documento, usuario: string) => actualizar(d.id, { accion: 'enviado', usuario }, () => ({ estado: 'pendiente_firma' }));

/** CUS46: el trabajador comunica una observación. */
export const observarDocumento = (d: Documento, nota: string, usuario: string) =>
  actualizar(d.id, { accion: 'observado', usuario, nota }, () => ({ estado: 'observado' }));

/** CUS47: RR. HH. corrige; se crea una nueva versión y vuelve a firma. */
export const corregirDocumento = (d: Documento, usuario: string, archivo?: string) =>
  actualizar(d.id, { accion: 'corregido', usuario, nota: archivo ? `Nueva versión: ${archivo}` : undefined }, (x) => ({
    version: x.version + 1,
    estado: 'pendiente_firma',
    origen: archivo ? { tipo: 'archivo', nombre: archivo } : x.origen,
  }));

/** CUS48: firma electrónica del trabajador. */
export const firmarDocumento = (d: Documento, usuario: string, firmaImagen: string) =>
  actualizar(d.id, { accion: 'firmado', usuario, firmaImagen }, () => ({ estado: 'firmado' }));
