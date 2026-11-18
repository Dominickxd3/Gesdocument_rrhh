/**
 * Usuarios de prueba para la presentación del mockup.
 * Se eliminarán al conectar la autenticación con el servidor (Nest.js + SQL Server).
 */
export interface UsuarioPrueba {
  id: string;
  /** Nombre de usuario para iniciar sesión (también se acepta el correo). */
  usuario: string;
  nombre: string;
  correo: string;
  cargo: string;
  clave: string;
}

export const usuariosPrueba: UsuarioPrueba[] = [
  {
    id: '0',
    usuario: 'admin',
    nombre: 'Administrador',
    correo: 'admin@grupopecuario.com',
    cargo: 'Administrador del sistema',
    clave: 'admin123',
  },
  {
    id: '1',
    usuario: 'maria.torres',
    nombre: 'María Torres',
    correo: 'maria.torres@grupopecuario.com',
    cargo: 'Analista de RR. HH.',
    clave: 'Mockup2026',
  },
  {
    id: '2',
    usuario: 'carlos.ramirez',
    nombre: 'Carlos Ramírez',
    correo: 'carlos.ramirez@grupopecuario.com',
    cargo: 'Jefe de RR. HH.',
    clave: 'Mockup2026',
  },
];
