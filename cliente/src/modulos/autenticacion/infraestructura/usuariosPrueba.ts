import type { Rol } from '@/compartido/sesion/tipos';

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
  rol: Rol;
  /** Solo para trabajadores: vincula la cuenta con su ficha. */
  dni?: string;
  /** Solo para Seguridad: la sede donde controla las salidas. */
  sede?: string;
  clave: string;
}

export const usuariosPrueba: UsuarioPrueba[] = [
  {
    id: '0',
    usuario: 'admin',
    nombre: 'Administrador',
    correo: 'admin@grupopecuario.com',
    cargo: 'Administrador del sistema',
    rol: 'administrador',
    clave: 'admin123',
  },
  {
    id: '1',
    usuario: 'maria.torres',
    nombre: 'María Torres',
    correo: 'maria.torres@grupopecuario.com',
    cargo: 'Analista de RR. HH.',
    rol: 'rrhh',
    clave: 'Mockup2026',
  },
  {
    id: '2',
    usuario: 'carlos.ramirez',
    nombre: 'Carlos Ramírez',
    correo: 'carlos.ramirez@grupopecuario.com',
    cargo: 'Jefe de RR. HH.',
    rol: 'rrhh',
    clave: 'Mockup2026',
  },
  {
    id: '3',
    usuario: 'jose.quispe',
    nombre: 'José Quispe Rojas',
    correo: 'jose.quispe@grupopecuario.com',
    cargo: 'Operario de producción',
    rol: 'trabajador',
    dni: '45871236',
    clave: 'Mockup2026',
  },
  {
    id: '4',
    usuario: 'seguridad',
    nombre: 'Pedro Vigo Salas',
    correo: 'seguridad.lima@grupopecuario.com',
    cargo: 'Prevencionista de Seguridad',
    rol: 'seguridad',
    dni: '46213578',
    sede: 'Lima – Canto Bello',
    clave: 'Mockup2026',
  },
];
