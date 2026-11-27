import { ahoraIso, crearAlmacen, haceDias } from '@/compartido/almacen/crearAlmacen';

/**
 * Documentos personales que el colaborador entrega en digital (Reglamento Interno, Art. 13°).
 * Todos entregan su foto, su CV en PDF y su DNI en imagen. Si RR. HH. necesita algo más
 * (antecedentes, certificados…), se lo pide y el colaborador lo sube desde "Mi expediente".
 */

export type FormatoPersonal = 'pdf' | 'imagen';

export const FORMATOS: Record<FormatoPersonal, { etiqueta: string; aceptar: string; patron: RegExp }> = {
  pdf: { etiqueta: 'PDF', aceptar: '.pdf,application/pdf', patron: /\.pdf$/i },
  imagen: { etiqueta: 'PNG o JPG', aceptar: '.png,.jpg,.jpeg,image/png,image/jpeg', patron: /\.(png|jpe?g)$/i },
};

/** Lo que se le pide al colaborador: los tres de siempre o un pedido de RR. HH. */
export interface PedidoPersonal {
  id: string;
  nombre: string;
  formato: FormatoPersonal;
  /** Uno de los tres de siempre (foto, CV, DNI); RR. HH. igual puede corregirlo o quitarlo por colaborador. */
  base?: boolean;
  /** Pedido de siempre que RR. HH. quitó para este colaborador. */
  quitado?: boolean;
  nota?: string;
  pedidoPor?: string;
  fecha?: string;
}

export const PEDIDOS_BASE: PedidoPersonal[] = [
  { id: 'foto', nombre: 'Foto tamaño carné', formato: 'imagen', base: true },
  { id: 'cv', nombre: 'Currículum vitae', formato: 'pdf', base: true },
  { id: 'dni', nombre: 'DNI (ambas caras)', formato: 'imagen', base: true },
];

/** Documentos que RR. HH. suele pedir después; también puede escribir otro. */
export const PEDIDOS_SUGERIDOS: { nombre: string; formato: FormatoPersonal }[] = [
  { nombre: 'Certificado de antecedentes policiales', formato: 'pdf' },
  { nombre: 'Certificado de antecedentes penales', formato: 'pdf' },
  { nombre: 'Certificado médico / carné de sanidad', formato: 'pdf' },
  { nombre: 'Certificado de estudios', formato: 'pdf' },
  { nombre: 'Certificado de trabajo anterior', formato: 'pdf' },
  { nombre: 'Recibo de luz o agua (domicilio)', formato: 'imagen' },
];

export interface ArchivoPersonal {
  id: string;
  dni: string;
  /** Pedido al que responde (foto, cv, dni o el id del pedido de RR. HH.). */
  pedido: string;
  archivo: string;
  subidoPor: string;
  fecha: string;
}

interface EstadoPersonales {
  /** Pedidos adicionales de RR. HH. y cambios a los de siempre, por DNI. */
  pedidos: (PedidoPersonal & { dni: string })[];
  archivos: ArchivoPersonal[];
}

/** Ejemplo: José ya subió su DNI y su CV; le falta la foto y RR. HH. le pidió sus antecedentes. */
export const almacenPersonales = crearAlmacen<EstadoPersonales>(() => ({
  pedidos: [
    { id: 'ped-1', dni: '45871236', nombre: 'Certificado de antecedentes policiales', formato: 'pdf', pedidoPor: 'María Torres', fecha: haceDias(3, '10:00'), nota: 'Puedes sacarlo en línea en la web de la PNP.' },
  ],
  archivos: [
    { id: 'per-1', dni: '45871236', pedido: 'dni', archivo: 'DNI_45871236.png', subidoPor: 'José Quispe Rojas', fecha: haceDias(14, '09:10') },
    { id: 'per-2', dni: '45871236', pedido: 'cv', archivo: 'CV_Jose_Quispe.pdf', subidoPor: 'José Quispe Rojas', fecha: haceDias(14, '09:12') },
  ],
}));

export const usePersonales = () => almacenPersonales.usar();

/** Pedidos del colaborador (los tres de siempre y los de RR. HH.) con su archivo, si ya lo subió. */
export function pedidosDe(estado: EstadoPersonales, dni: string) {
  const propios = estado.pedidos.filter((p) => p.dni === dni);
  // Los de siempre, con los cambios que RR. HH. les haya hecho para este colaborador.
  const base = PEDIDOS_BASE.map((b) => propios.find((p) => p.base && p.id === b.id) ?? b);
  const pedidos = [...base, ...propios.filter((p) => !p.base)].filter((p) => !p.quitado);
  return pedidos.map((p) => ({ ...p, entregado: estado.archivos.find((a) => a.dni === dni && a.pedido === p.id) }));
}

/** El colaborador sube (o cambia) el archivo de un pedido. */
export function subirPersonal(dni: string, pedido: string, archivo: string, usuario: string) {
  almacenPersonales.escribir((e) => ({
    ...e,
    archivos: [{ id: `per-${Date.now()}`, dni, pedido, archivo, subidoPor: usuario, fecha: ahoraIso() }, ...e.archivos.filter((a) => !(a.dni === dni && a.pedido === pedido))],
  }));
}

/** RR. HH. quita un archivo: el pedido vuelve a quedar pendiente para que lo suba de nuevo. */
export function quitarPersonal(id: string) {
  almacenPersonales.escribir((e) => ({ ...e, archivos: e.archivos.filter((a) => a.id !== id) }));
}

/** RR. HH. pide un documento más. */
export function pedirPersonal(dni: string, nombre: string, formato: FormatoPersonal, nota: string, usuario: string) {
  almacenPersonales.escribir((e) => ({
    ...e,
    pedidos: [...e.pedidos, { id: `ped-${Date.now()}`, dni, nombre, formato, nota: nota || undefined, pedidoPor: usuario, fecha: ahoraIso() }],
  }));
}

/**
 * RR. HH. corrige un pedido (nombre, formato o indicaciones). Si cambia el formato y el archivo
 * ya subido no lo cumple, se quita para que el colaborador lo suba en el formato correcto.
 */
export function editarPedido(dni: string, id: string, nombre: string, formato: FormatoPersonal, nota: string) {
  almacenPersonales.escribir((e) => ({
    pedidos: conCambio(e.pedidos, dni, id, { nombre, formato, nota: nota || undefined }),
    archivos: e.archivos.filter((a) => a.dni !== dni || a.pedido !== id || FORMATOS[formato].patron.test(a.archivo)),
  }));
}

/** Aplica un cambio a un pedido; si es uno de los de siempre, guarda la versión propia del colaborador. */
function conCambio(pedidos: EstadoPersonales['pedidos'], dni: string, id: string, cambio: Partial<PedidoPersonal>) {
  const base = PEDIDOS_BASE.find((b) => b.id === id);
  if (!base) return pedidos.map((p) => (p.id === id ? { ...p, ...cambio } : p));
  const actual = pedidos.find((p) => p.dni === dni && p.base && p.id === id) ?? { ...base, dni };
  return [...pedidos.filter((p) => !(p.dni === dni && p.base && p.id === id)), { ...actual, ...cambio }];
}

/** RR. HH. cancela un pedido (y su archivo, si ya lo había subido). */
export function cancelarPedido(dni: string, id: string) {
  almacenPersonales.escribir((e) => ({
    pedidos: PEDIDOS_BASE.some((b) => b.id === id) ? conCambio(e.pedidos, dni, id, { quitado: true }) : e.pedidos.filter((p) => p.id !== id),
    archivos: e.archivos.filter((a) => a.dni !== dni || a.pedido !== id),
  }));
}
