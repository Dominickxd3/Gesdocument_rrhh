import type { UsuarioSesion } from './tipos';

/**
 * Guarda la sesión en el navegador.
 * Con "recordarme" se usa localStorage durante 30 días; sin él, sessionStorage (se borra al cerrar el navegador).
 */
const CLAVE = 'gesdocument-rrhh:sesion';
const DURACION_RECORDAR_MS = 30 * 24 * 60 * 60 * 1000;

interface SesionGuardada {
  usuario: UsuarioSesion;
  expira: number | null;
}

function leerDe(almacen: Storage): UsuarioSesion | null {
  try {
    const texto = almacen.getItem(CLAVE);
    if (!texto) return null;
    const sesion = JSON.parse(texto) as SesionGuardada;
    if (sesion.expira !== null && sesion.expira < Date.now()) {
      almacen.removeItem(CLAVE);
      return null;
    }
    return sesion.usuario;
  } catch {
    return null;
  }
}

export function leerSesion(): UsuarioSesion | null {
  return leerDe(sessionStorage) ?? leerDe(localStorage);
}

export function guardarSesion(usuario: UsuarioSesion, recordar: boolean): void {
  borrarSesion();
  const sesion: SesionGuardada = {
    usuario,
    expira: recordar ? Date.now() + DURACION_RECORDAR_MS : null,
  };
  try {
    (recordar ? localStorage : sessionStorage).setItem(CLAVE, JSON.stringify(sesion));
  } catch {
    // Sin almacenamiento disponible: la sesión dura mientras la página siga abierta.
  }
}

export function borrarSesion(): void {
  try {
    localStorage.removeItem(CLAVE);
    sessionStorage.removeItem(CLAVE);
  } catch {
    // Nada que borrar.
  }
}
