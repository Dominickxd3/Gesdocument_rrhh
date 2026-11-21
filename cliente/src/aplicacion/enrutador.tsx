import type { ReactNode } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { DisenoPrincipal } from '@/compartido/diseno/DisenoPrincipal';
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida';
import { RedireccionInicial, RutaParaRoles, SoloGestores } from '@/compartido/sesion/RutaParaRoles';
import { PaginaMiExpediente } from '@/modulos/mi-expediente/paginas/PaginaMiExpediente';
import type { Rol } from '@/compartido/sesion/tipos';
import { PaginaInicio } from '@/modulos/inicio/paginas/PaginaInicio';
import { PaginaDocumentos } from '@/modulos/documentos/paginas/PaginaDocumentos';
import { PaginaExpediente } from '@/modulos/documentos/paginas/PaginaExpediente';
import { PaginaBoletasPago } from '@/modulos/boletas-pago/paginas/PaginaBoletasPago';
import { PaginaPapeletasPermiso } from '@/modulos/papeletas-permiso/paginas/PaginaPapeletasPermiso';
import { PaginaControlSalidas } from '@/modulos/control-salidas/paginas/PaginaControlSalidas';
import { PaginaDescansosMedicos } from '@/modulos/descansos-medicos/paginas/PaginaDescansosMedicos';
import { PaginaIncidencias } from '@/modulos/incidencias/paginas/PaginaIncidencias';
import { PaginaTrabajadores } from '@/modulos/trabajadores/paginas/PaginaTrabajadores';
import { PaginaPlantillas } from '@/modulos/plantillas/paginas/PaginaPlantillas';
import { PaginaReportes } from '@/modulos/reportes/paginas/PaginaReportes';
import { PaginaInicioSesion } from '@/modulos/autenticacion/paginas/PaginaInicioSesion';
import { PaginaConfiguracionBoletas } from '@/modulos/boletas-pago/paginas/PaginaConfiguracionBoletas';
import { PaginaMiCuenta } from '@/modulos/mi-cuenta/paginas/PaginaMiCuenta';

/** Quién entra a cada pantalla (RNF01). Seguridad solo controla salidas (RF12, RNF02). */
const GESTORES: Rol[] = ['rrhh', 'administrador'];
const PERSONAL: Rol[] = ['trabajador', 'rrhh', 'administrador', 'seguridad'];
const SEGURIDAD: Rol[] = ['seguridad'];
const TRABAJADORES: Rol[] = ['trabajador', 'seguridad'];

const solo = (roles: Rol[], pagina: ReactNode) => <RutaParaRoles roles={roles}>{pagina}</RutaParaRoles>;
/** Pantalla de gestión; el trabajador que llegue aquí va a la sección equivalente de su expediente. */
const gestion = (rutaTrabajador: string, pagina: ReactNode) => <SoloGestores rutaTrabajador={rutaTrabajador}>{pagina}</SoloGestores>;

export const enrutador = createBrowserRouter([
  { path: '/iniciar-sesion', element: <PaginaInicioSesion /> },
  {
    path: '/',
    element: (
      <RutaProtegida>
        <DisenoPrincipal />
      </RutaProtegida>
    ),
    children: [
      { index: true, element: <RedireccionInicial /> },
      { path: 'inicio', element: solo(PERSONAL, <PaginaInicio />) },
      {
        path: 'mi-expediente',
        element: solo(TRABAJADORES, <PaginaMiExpediente />),
        children: [
          { index: true, element: <Navigate to="documentos" replace /> },
          { path: 'documentos', element: <PaginaDocumentos /> },
          { path: 'boletas', element: <PaginaBoletasPago /> },
          { path: 'descansos-medicos', element: <PaginaDescansosMedicos /> },
          { path: 'memorandums', element: <PaginaIncidencias /> },
        ],
      },
      { path: 'documentos', element: gestion('/mi-expediente/documentos', <PaginaDocumentos />) },
      { path: 'documentos/expediente/:dni', element: solo(GESTORES, <PaginaExpediente />) },
      { path: 'boletas-pago', element: gestion('/mi-expediente/boletas', <PaginaBoletasPago />) },
      { path: 'boletas-pago/configuracion', element: solo(GESTORES, <PaginaConfiguracionBoletas />) },
      { path: 'papeletas-permiso', element: solo(PERSONAL, <PaginaPapeletasPermiso />) },
      { path: 'control-salidas', element: solo(SEGURIDAD, <PaginaControlSalidas />) },
      { path: 'descansos-medicos', element: gestion('/mi-expediente/descansos-medicos', <PaginaDescansosMedicos />) },
      { path: 'incidencias', element: gestion('/mi-expediente/memorandums', <PaginaIncidencias />) },
      { path: 'trabajadores', element: solo(GESTORES, <PaginaTrabajadores />) },
      { path: 'plantillas', element: solo(GESTORES, <PaginaPlantillas />) },
      { path: 'reportes', element: solo(GESTORES, <PaginaReportes />) },
      { path: 'mi-cuenta', element: <PaginaMiCuenta /> },
      { path: '*', element: <RedireccionInicial /> },
    ],
  },
]);
