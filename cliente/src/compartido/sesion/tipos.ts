/** Contrato de autenticación que comparten la interfaz y cualquier implementación. */

export interface Credenciales {
  /** Nombre de usuario o correo electrónico. */
  usuario: string;
  clave: string;
}

/** Rol que decide qué pantallas y acciones ve el usuario. */
export type Rol = 'trabajador' | 'rrhh' | 'administrador' | 'seguridad';

/** Nombre visible de cada rol. */
export const NOMBRE_ROL: Record<Rol, string> = {
  trabajador: 'Trabajador',
  rrhh: 'Recursos Humanos',
  administrador: 'Administrador',
  seguridad: 'Seguridad',
};

export interface UsuarioSesion {
  id: string;
  nombre: string;
  correo: string;
  cargo: string;
  /** Opcional solo por las sesiones guardadas antes de existir los roles (se toman como RR. HH.). */
  rol?: Rol;
  /** DNI del trabajador; vincula al usuario con su ficha y sus documentos. */
  dni?: string;
  /** Sede donde trabaja; Seguridad solo controla las salidas de su sede (RF12). */
  sede?: string;
}

export const rolDe = (usuario: UsuarioSesion): Rol => usuario.rol ?? 'rrhh';

/** RR. HH. y administrador gestionan; el trabajador y Seguridad no. */
export const esGestor = (usuario: UsuarioSesion) => {
  const rol = rolDe(usuario);
  return rol === 'rrhh' || rol === 'administrador';
};

/** Pantalla con la que empieza cada rol. Seguridad también es trabajador: empieza en Inicio. */
export const rutaInicialPara = (_rol: Rol) => '/inicio';

export interface ServicioAutenticacion {
  /** Devuelve el usuario si las credenciales son válidas; si no, lanza `ErrorCredenciales`. */
  iniciarSesion(credenciales: Credenciales): Promise<UsuarioSesion>;
  /** Datos vigentes de un usuario con sesión guardada (p. ej. si cambió su ficha); null si ya no existe. */
  actualizarSesion?(usuario: UsuarioSesion): UsuarioSesion | null;
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
