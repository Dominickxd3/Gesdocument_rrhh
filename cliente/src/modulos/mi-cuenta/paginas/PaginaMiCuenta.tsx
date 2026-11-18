import { Avatar } from 'primereact/avatar';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { obtenerIniciales } from '@/compartido/sesion/tipos';
import './miCuenta.css';

/** Datos de la cuenta del usuario en sesión (opción "Configurar" del menú del usuario). */
export function PaginaMiCuenta() {
  const usuario = useUsuarioActual();
  const datos = [
    { etiqueta: 'Nombre', valor: usuario.nombre },
    { etiqueta: 'Cargo', valor: usuario.cargo },
    { etiqueta: 'Correo', valor: usuario.correo },
  ];

  return (
    <div className="pagina-mi-cuenta">
      <header>
        <h1>Mi cuenta</h1>
        <p>Datos del usuario con el que iniciaste sesión</p>
      </header>

      <section className="tarjeta-mi-cuenta">
        <div className="tarjeta-mi-cuenta__perfil">
          <Avatar label={obtenerIniciales(usuario.nombre)} shape="circle" size="xlarge" className="tarjeta-mi-cuenta__avatar" />
          <div>
            <strong>{usuario.nombre}</strong>
            <span>{usuario.cargo}</span>
          </div>
        </div>
        <dl className="tarjeta-mi-cuenta__datos">
          {datos.map(({ etiqueta, valor }) => (
            <div key={etiqueta}>
              <dt>{etiqueta}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>
        <p className="tarjeta-mi-cuenta__nota">
          <i className="pi pi-info-circle" aria-hidden="true" />
          Para cambiar tus datos o tu contraseña, contacta con el área de Sistemas.
        </p>
      </section>
    </div>
  );
}
