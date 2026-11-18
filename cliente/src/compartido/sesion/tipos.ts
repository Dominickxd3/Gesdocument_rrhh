/** Contrato de autenticación que comparten la interfaz y cualquier implementación. */

export interface Credenciales {
  /** Nombre de usuario o correo electrónico. */
  usuario: string;
  clave: string;
}

export interface UsuarioSesion {
  id: string;
  nombre: string;
  correo: string;
  cargo: string;
}

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
