/**
 * Qué tiene pendiente cada usuario en cada módulo. Alimenta los números del menú y la página de Inicio.
 * Vive en `aplicacion` (punto de composición) para que `compartido` no dependa de los módulos.
 */
import { registrarContador } from '@/compartido/navegacion/contadores';
import { esGestor, type UsuarioSesion } from '@/compartido/sesion/tipos';
import { almacenDocumentos } from '@/modulos/documentos/aplicacion/almacenDocumentos';
import { almacenIncidencias } from '@/modulos/incidencias/aplicacion/almacenIncidencias';
import { leerDescansos } from '@/modulos/descansos-medicos/aplicacion/almacenDescansos';
import { almacenPapeletas } from '@/modulos/papeletas-permiso/aplicacion/almacenPapeletas';
import { faltaFirmaColaborador } from '@/modulos/papeletas-permiso/dominio/papeleta';

export interface Pendiente {
  ruta: string;
  icono: string;
  titulo: string;
  detalle: string;
  cantidad: number;
}

export function pendientesDe(usuario: UsuarioSesion): Pendiente[] {
  const documentos = almacenDocumentos.leer();
  const incidencias = almacenIncidencias.leer();
  const descansos = leerDescansos();
  const papeletas = almacenPapeletas.leer();

  if (esGestor(usuario)) {
    return [
      {
        ruta: '/descansos-medicos',
        icono: 'pi pi-heart',
        titulo: 'Descansos médicos por revisar',
        detalle: 'Sustentos presentados que esperan tu revisión',
        cantidad: descansos.filter((d) => d.estado === 'pendiente_revision').length,
      },
      {
        ruta: '/documentos',
        icono: 'pi pi-folder',
        titulo: 'Documentos observados',
        detalle: 'El trabajador pidió una corrección',
        cantidad: documentos.filter((d) => d.estado === 'observado').length,
      },
      {
        ruta: '/incidencias',
        icono: 'pi pi-exclamation-triangle',
        titulo: 'Incidencias abiertas',
        detalle: 'Registradas o en investigación',
        cantidad: incidencias.filter((i) => i.estado === 'registrada' || i.estado === 'en_investigacion').length,
      },
    ];
  }

  return [
    {
      ruta: '/mi-expediente/documentos',
      icono: 'pi pi-pencil',
      titulo: 'Documentos por firmar',
      detalle: 'Contratos, adendas y cargos enviados por RR. HH.',
      cantidad: documentos.filter((d) => d.dni === usuario.dni && d.estado === 'pendiente_firma').length,
    },
    {
      ruta: '/papeletas-permiso',
      icono: 'pi pi-clock',
      titulo: 'Papeletas por firmar',
      detalle: 'RR. HH. las aprobó; fírmalas antes de salir',
      cantidad: papeletas.filter((p) => p.trabajador.dni === usuario.dni && faltaFirmaColaborador(p)).length,
    },
    {
      ruta: '/mi-expediente/descansos-medicos',
      icono: 'pi pi-heart',
      titulo: 'Descansos médicos por completar',
      detalle: 'Falta subir o corregir tu certificado',
      cantidad: descansos.filter((d) => d.trabajador.dni === usuario.dni && (d.estado === 'aviso' || d.estado === 'observado')).length,
    },
    {
      ruta: '/mi-expediente/memorandums',
      icono: 'pi pi-inbox',
      titulo: 'Memorándums por recibir',
      detalle: 'Firma la recepción',
      cantidad: incidencias.filter((i) => i.dni === usuario.dni && i.estado === 'memo_emitido').length,
    },
  ];
}

// Rutas de RR. HH. y de las secciones de "Mi expediente" del trabajador.
for (const ruta of ['/papeletas-permiso', '/descansos-medicos', '/documentos', '/incidencias', '/mi-expediente/documentos', '/mi-expediente/descansos-medicos', '/mi-expediente/memorandums']) {
  registrarContador(ruta, (usuario) => pendientesDe(usuario).find((p) => p.ruta === ruta)?.cantidad ?? 0);
}
