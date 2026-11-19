import { ErrorCredenciales, type Credenciales, type ServicioAutenticacion, type UsuarioSesion } from '@/compartido/sesion/tipos';
import { usuariosPrueba } from './usuariosPrueba';

const DEMORA_SIMULADA_MS = 400;

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

    const { id, nombre, correo, cargo, rol, dni } = encontrado;
    return { id, nombre, correo, cargo, rol, dni };
  }
}
