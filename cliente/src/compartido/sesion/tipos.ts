/** Contrato de autenticación que comparten la interfaz y cualquier implementación. */

export interface Credenciales {
  /** Nombre de usuario o correo electrónico. */
  usuario: string;
  clave: string;
}

/** Rol que decide qué pantallas y acciones ve el usuario. */
export type Rol = 'trabajador' | 'rrhh' | 'administrador';

export interface UsuarioSesion {
  id: string;
  nombre: string;
  correo: string;
  cargo: string;
  /** Opcional solo por las sesiones guardadas antes de existir los roles (se toman como RR. HH.). */
  rol?: Rol;
  /** DNI del trabajador; vincula al usuario con su ficha y sus documentos. */
  dni?: string;
}

export const rolDe = (usuario: UsuarioSesion): Rol => usuario.rol ?? 'rrhh';

/** RR. HH. y administrador gestionan; el trabajador solo ve lo suyo. */
export const esGestor = (usuario: UsuarioSesion) => rolDe(usuario) !== 'trabajador';

export interface ServicioAutenticacion {
  /** Devuelve el usuario si las credenciales son válidas; si no, lanza `ErrorCredenciales`. */
  iniciarSesion(credenciales: Credenciales): Promise<UsuarioSesion>;
}

export class ErrorCredenciales extends Error {
  constructor() {
    super('Usuario o contraseña incorrectos.');
    this.name = 'ErrorCredenciales';
  }
}

export function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]!.toUpperCase())
    .join('');
}
