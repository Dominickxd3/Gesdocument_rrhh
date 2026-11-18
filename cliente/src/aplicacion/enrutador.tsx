import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DisenoPrincipal } from '@/compartido/diseno/DisenoPrincipal';
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida';
import { PaginaInicio } from '@/modulos/inicio/paginas/PaginaInicio';
import { PaginaDocumentos } from '@/modulos/documentos/paginas/PaginaDocumentos';
import { PaginaBoletasPago } from '@/modulos/boletas-pago/paginas/PaginaBoletasPago';
import { PaginaPapeletasPermiso } from '@/modulos/papeletas-permiso/paginas/PaginaPapeletasPermiso';
import { PaginaDescansosMedicos } from '@/modulos/descansos-medicos/paginas/PaginaDescansosMedicos';
import { PaginaIncidencias } from '@/modulos/incidencias/paginas/PaginaIncidencias';
import { PaginaTrabajadores } from '@/modulos/trabajadores/paginas/PaginaTrabajadores';
import { PaginaPlantillas } from '@/modulos/plantillas/paginas/PaginaPlantillas';
import { PaginaReportes } from '@/modulos/reportes/paginas/PaginaReportes';
import { PaginaInicioSesion } from '@/modulos/autenticacion/paginas/PaginaInicioSesion';
import { PaginaConfiguracionBoletas } from '@/modulos/boletas-pago/paginas/PaginaConfiguracionBoletas';
import { PaginaMiCuenta } from '@/modulos/mi-cuenta/paginas/PaginaMiCuenta';

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
      { index: true, element: <Navigate to="/inicio" replace /> },
      { path: 'inicio', element: <PaginaInicio /> },
      { path: 'documentos', element: <PaginaDocumentos /> },
      { path: 'boletas-pago', element: <PaginaBoletasPago /> },
      { path: 'boletas-pago/configuracion', element: <PaginaConfiguracionBoletas /> },
      { path: 'papeletas-permiso', element: <PaginaPapeletasPermiso /> },
      { path: 'descansos-medicos', element: <PaginaDescansosMedicos /> },
      { path: 'incidencias', element: <PaginaIncidencias /> },
      { path: 'trabajadores', element: <PaginaTrabajadores /> },
      { path: 'plantillas', element: <PaginaPlantillas /> },
      { path: 'reportes', element: <PaginaReportes /> },
      { path: 'mi-cuenta', element: <PaginaMiCuenta /> },
      { path: '*', element: <Navigate to="/inicio" replace /> },
    ],
  },
]);
