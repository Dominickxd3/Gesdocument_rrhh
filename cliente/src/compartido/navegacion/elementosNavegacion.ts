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

export const gruposNavegacion: GrupoNavegacion[] = [
  {
    titulo: 'Espacio de trabajo',
    elementos: [
      { etiqueta: 'Inicio', ruta: '/inicio', icono: 'pi pi-home' },
      { etiqueta: 'Documentos', etiquetaTrabajador: 'Mis documentos', ruta: '/documentos', icono: 'pi pi-folder' },
      {
        etiqueta: 'Boletas de pago',
        ruta: '/boletas-pago',
        icono: 'pi pi-wallet',
        hijos: [
          { etiqueta: 'Configuración', ruta: '/boletas-pago/configuracion', icono: 'pi pi-cog', roles: GESTORES },
        ],
      },
      { etiqueta: 'Papeletas de permiso', ruta: '/papeletas-permiso', icono: 'pi pi-clock' },
      { etiqueta: 'Descansos médicos', ruta: '/descansos-medicos', icono: 'pi pi-heart' },
      // El trabajador solo ve los memorándums que se le emitieron (CUS36–CUS39).
      { etiqueta: 'Incidencias', etiquetaTrabajador: 'Mis memorándums', ruta: '/incidencias', icono: 'pi pi-exclamation-triangle' },
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
