import { ErrorCredenciales, type Credenciales, type ServicioAutenticacion, type UsuarioSesion } from '@/compartido/sesion/tipos';
import { usuariosPrueba } from './usuariosPrueba';

const DEMORA_SIMULADA_MS = 400;

const aSesion = ({ id, nombre, correo, cargo, rol, dni, sede }: (typeof usuariosPrueba)[number]): UsuarioSesion => ({ id, nombre, correo, cargo, rol, dni, sede });

/**
 * Validación local para el mockup: compara contra `usuariosPrueba`, sin servidor.
 * Acepta el nombre de usuario o el correo. Para producción se reemplaza por una
 * implementación HTTP de `ServicioAutenticacion`.
 */
export class ServicioAutenticacionLocal implements ServicioAutenticacion {
  async iniciarSesion({ usuario, clave }: Credenciales): Promise<UsuarioSesion> {
    await new Promise((resolver) => setTimeout(resolver, DEMORA_SIMULADA_MS));

    const identificador = usuario.trim().toLowerCase();
    const encontrado = usuariosPrueba.find(
      (prueba) =>
        (prueba.usuario === identificador || prueba.correo.toLowerCase() === identificador) &&
        prueba.clave === clave,
    );
    if (!encontrado) throw new ErrorCredenciales();

    return aSesion(encontrado);
  }

  actualizarSesion(usuario: UsuarioSesion): UsuarioSesion | null {
    const encontrado = usuariosPrueba.find((prueba) => prueba.id === usuario.id);
    return encontrado ? aSesion(encontrado) : null;
  }
}
