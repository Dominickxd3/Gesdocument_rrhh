/** Definición de los grupos y enlaces de la barra lateral. */
export interface ElementoNavegacion {
  etiqueta: string;
  ruta: string;
  icono: string;
  /** Cantidad de pendientes; se muestra solo si es mayor que cero. */
  pendientes?: number;
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

export const gruposNavegacion: GrupoNavegacion[] = [
  {
    titulo: 'Espacio de trabajo',
    elementos: [
      { etiqueta: 'Inicio', ruta: '/inicio', icono: 'pi pi-home' },
      { etiqueta: 'Documentos', ruta: '/documentos', icono: 'pi pi-folder', pendientes: 2 },
      {
        etiqueta: 'Boletas de pago',
        ruta: '/boletas-pago',
        icono: 'pi pi-wallet',
        hijos: [
          { etiqueta: 'Configuración', ruta: '/boletas-pago/configuracion', icono: 'pi pi-cog' },
        ],
      },
      { etiqueta: 'Papeletas de permiso', ruta: '/papeletas-permiso', icono: 'pi pi-clock' },
      { etiqueta: 'Descansos médicos', ruta: '/descansos-medicos', icono: 'pi pi-heart' },
      { etiqueta: 'Incidencias', ruta: '/incidencias', icono: 'pi pi-exclamation-triangle' },
    ],
  },
  {
    titulo: 'Administración',
    elementos: [
      { etiqueta: 'Trabajadores', ruta: '/trabajadores', icono: 'pi pi-users' },
      { etiqueta: 'Plantillas', ruta: '/plantillas', icono: 'pi pi-table' },
      { etiqueta: 'Reportes', ruta: '/reportes', icono: 'pi pi-chart-bar' },
    ],
  },
];
