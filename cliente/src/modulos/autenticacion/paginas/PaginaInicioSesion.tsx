import { Navigate } from 'react-router-dom';
import { useSesion } from '@/compartido/sesion/ContextoSesion';
import { FormularioInicioSesion } from '../componentes/FormularioInicioSesion';
import { IlustracionGestionDocumental } from '../componentes/IlustracionGestionDocumental';
import { LogoEmpresa } from '@/compartido/componentes/logo-empresa/LogoEmpresa';
import './inicioSesion.css';

export function PaginaInicioSesion() {
  const { usuario } = useSesion();
  if (usuario) return <Navigate to="/inicio" replace />;

  return (
    <div className="inicio-sesion">
      <section className="inicio-sesion__formulario">
        <LogoEmpresa />
        <div className="inicio-sesion__contenido">
          <h1>Bienvenido</h1>
          <p className="inicio-sesion__subtitulo">Ingresa tus datos para continuar</p>
          <FormularioInicioSesion />
        </div>
      </section>

      <aside className="inicio-sesion__panel" aria-hidden="true">
        <IlustracionGestionDocumental />
      </aside>
    </div>
  );
}
