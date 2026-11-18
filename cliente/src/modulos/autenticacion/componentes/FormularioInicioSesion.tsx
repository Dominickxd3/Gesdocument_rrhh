import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Message } from 'primereact/message';
import { useSesion } from '@/compartido/sesion/ContextoSesion';
import { ErrorCredenciales } from '@/compartido/sesion/tipos';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';

interface ErroresFormulario {
  usuario?: string;
  clave?: string;
}

function validar(usuario: string, clave: string): ErroresFormulario {
  const errores: ErroresFormulario = {};
  if (!usuario.trim()) errores.usuario = 'Ingresa tu usuario o correo.';
  if (!clave) errores.clave = 'Ingresa tu contraseña.';
  return errores;
}

export function FormularioInicioSesion() {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const { iniciarSesion } = useSesion();
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [recordar, setRecordar] = useState(false);
  const [errores, setErrores] = useState<ErroresFormulario>({});

  const alEnviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const nuevosErrores = validar(usuario, clave);
    setErrores(nuevosErrores);
    setErrorGeneral(null);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    try {
      await iniciarSesion({ usuario, clave }, recordar);
      const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/inicio';
      navegar(destino, { replace: true });
    } catch (error) {
      setErrorGeneral(
        error instanceof ErrorCredenciales ? error.message : 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      );
      setEnviando(false);
    }
  };

  return (
    <form className="formulario-inicio-sesion" onSubmit={alEnviar} noValidate>
      {errorGeneral && (
        <Message severity="error" text={errorGeneral} className="formulario-inicio-sesion__alerta" />
      )}

      <div className="campo">
        <label htmlFor="usuario">Usuario o correo</label>
        <InputText
          id="usuario"
          autoComplete="username"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          invalid={!!errores.usuario}
          aria-describedby={errores.usuario ? 'error-usuario' : undefined}
        />
        {errores.usuario && <small id="error-usuario" className="campo__error">{errores.usuario}</small>}
      </div>

      <div className="campo">
        <label htmlFor="clave">Contraseña</label>
        <Password
          inputId="clave"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          feedback={false}
          toggleMask
          autoComplete="current-password"
          invalid={!!errores.clave}
          aria-describedby={errores.clave ? 'error-clave' : undefined}
        />
        {errores.clave && <small id="error-clave" className="campo__error">{errores.clave}</small>}
      </div>

      <div className="formulario-inicio-sesion__opciones">
        <label className="opcion-recordar">
          <Checkbox inputId="recordar" checked={recordar} onChange={(e) => setRecordar(!!e.checked)} />
          <span>Recordarme por 30 días</span>
        </label>
        <a href="#" className="enlace-secundario" onClick={(e) => e.preventDefault()}>
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <Button
        type="submit"
        label={enviando ? 'Validando…' : 'Iniciar sesión'}
        loading={enviando}
        className="boton-principal"
      />

      <p className="formulario-inicio-sesion__ayuda">
        ¿No tienes acceso? Contacta con el área de Sistemas.
      </p>
    </form>
  );
}
