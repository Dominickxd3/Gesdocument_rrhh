import type { Rol } from '@/compartido/sesion/tipos';

/** Definición de los grupos y enlaces de la barra lateral. */
export interface ElementoNavegacion {
  etiqueta: string;
  ruta: string;
  icono: string;
  /** Etiqueta que ve el trabajador, cuando su pantalla es distinta (p. ej. "Mis documentos"). */
  etiquetaTrabajador?: string;
  /** Roles que ven el enlace; si se omite, lo ven todos. */
  roles?: Rol[];
  /**
   * Subopciones: el clic lleva a la ruta del elemento y despliega las subopciones;
   * otro clic estando dentro las oculta.
   */
  hijos?: ElementoNavegacion[];
}

export interface GrupoNavegacion {
  titulo: string;
  elementos: ElementoNavegacion[];
}

const GESTORES: Rol[] = ['rrhh', 'administrador'];
/** Todos los usuarios. Seguridad es un trabajador más, con el permiso adicional de Control de salidas. */
const PERSONAL: Rol[] = ['trabajador', 'rrhh', 'administrador', 'seguridad'];
/** Quienes ven solo sus propios datos (RNF01). */
const TRABAJADORES: Rol[] = ['trabajador', 'seguridad'];

export const gruposNavegacion: GrupoNavegacion[] = [
  {
    titulo: 'Espacio de trabajo',
    elementos: [
      { etiqueta: 'Inicio', ruta: '/inicio', icono: 'pi pi-home', roles: PERSONAL },
      { etiqueta: 'Control de salidas', ruta: '/control-salidas', icono: 'pi pi-shield', roles: ['seguridad'] },
      // El trabajador tiene todo lo suyo agrupado en "Mi expediente".
      {
        etiqueta: 'Mi expediente',
        ruta: '/mi-expediente',
        icono: 'pi pi-folder-open',
        roles: TRABAJADORES,
        hijos: [
          { etiqueta: 'Documentos', ruta: '/mi-expediente/documentos', icono: 'pi pi-file' },
          { etiqueta: 'Boletas de pago', ruta: '/mi-expediente/boletas', icono: 'pi pi-wallet' },
          { etiqueta: 'Descansos médicos', ruta: '/mi-expediente/descansos-medicos', icono: 'pi pi-heart' },
          { etiqueta: 'Memorándums', ruta: '/mi-expediente/memorandums', icono: 'pi pi-exclamation-triangle' },
        ],
      },
      { etiqueta: 'Expedientes', ruta: '/documentos', icono: 'pi pi-folder', roles: GESTORES },
      {
        etiqueta: 'Boletas de pago',
        ruta: '/boletas-pago',
        icono: 'pi pi-wallet',
        roles: GESTORES,
        hijos: [
          { etiqueta: 'Configuración', ruta: '/boletas-pago/configuracion', icono: 'pi pi-cog', roles: GESTORES },
        ],
      },
      { etiqueta: 'Papeletas de permiso', etiquetaTrabajador: 'Mis papeletas', ruta: '/papeletas-permiso', icono: 'pi pi-clock', roles: PERSONAL },
      { etiqueta: 'Descansos médicos', ruta: '/descansos-medicos', icono: 'pi pi-heart', roles: GESTORES },
      { etiqueta: 'Incidencias', ruta: '/incidencias', icono: 'pi pi-exclamation-triangle', roles: GESTORES },
    ],
  },
  {
    titulo: 'Administración',
    elementos: [
      { etiqueta: 'Trabajadores', ruta: '/trabajadores', icono: 'pi pi-users', roles: GESTORES },
      { etiqueta: 'Plantillas', ruta: '/plantillas', icono: 'pi pi-table', roles: GESTORES },
      { etiqueta: 'Reportes', ruta: '/reportes', icono: 'pi pi-chart-bar', roles: GESTORES },
    ],
  },
];

/** Grupos y enlaces visibles para un rol; quita grupos y subopciones que queden vacíos. */
export function navegacionPara(rol: Rol): GrupoNavegacion[] {
  const visible = (e: ElementoNavegacion) => !e.roles || e.roles.includes(rol);
  return gruposNavegacion
    .map((grupo) => ({
      ...grupo,
      elementos: grupo.elementos.filter(visible).map((e) => {
        const hijos = e.hijos?.filter(visible);
        return hijos && hijos.length ? { ...e, hijos } : { ...e, hijos: undefined };
      }),
    }))
    .filter((grupo) => grupo.elementos.length > 0);
}
