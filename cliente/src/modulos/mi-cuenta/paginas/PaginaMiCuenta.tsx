import { useAviso } from '@/compartido/notificaciones/notificaciones';
import { useEffect, useState } from 'react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { NOMBRE_ROL, obtenerIniciales, rutaInicialPara } from '@/compartido/sesion/tipos';
import { BotonVolver } from '@/compartido/componentes/BotonVolver';
import { actualizarContacto, useTrabajadores } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { nombreLegible } from '@/modulos/trabajadores/dominio/trabajador';
import './miCuenta.css';

const correoValido = (correo: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim());
/** Celular peruano: 9 dígitos que empiezan con 9 (se aceptan espacios). */
const telefonoValido = (telefono: string) => /^9\d{8}$/.test(telefono.replace(/\s/g, ''));
const formatoTelefono = (telefono: string) => telefono.replace(/\s/g, '').replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3');

/**
 * Mi perfil (opción del menú del usuario). Los datos laborales vienen de RR. HH. y no se editan aquí;
 * el usuario solo puede cambiar sus datos personales de contacto: correo y teléfono.
 */
export function PaginaMiCuenta() {
  const usuario = useUsuarioActual();
  const ficha = useTrabajadores().find((t) => t.dni === usuario.dni);
  const aviso = useAviso();
  const [correo, setCorreo] = useState(ficha?.correo ?? '');
  const [telefono, setTelefono] = useState(ficha?.telefono ?? '');
  const [intentado, setIntentado] = useState(false);

  useEffect(() => {
    setCorreo(ficha?.correo ?? '');
    setTelefono(ficha?.telefono ?? '');
  }, [ficha?.correo, ficha?.telefono]);

  const errores = {
    correo: correoValido(correo) ? '' : 'Escribe un correo válido, por ejemplo nombre@correo.com',
    telefono: telefonoValido(telefono) ? '' : 'Escribe un celular de 9 dígitos que empiece con 9',
  };
  const cambio = !!ficha && (correo.trim() !== ficha.correo || formatoTelefono(telefono) !== ficha.telefono);

  const guardar = () => {
    setIntentado(true);
    if (!ficha || errores.correo || errores.telefono) return;
    actualizarContacto(ficha.dni, { correo: correo.trim(), telefono: formatoTelefono(telefono) });
    setIntentado(false);
    aviso.current?.show({ severity: 'success', summary: 'Datos actualizados', detail: 'Tu correo y teléfono quedaron guardados.', life: 3000 });
  };

  const laborales = [
    { etiqueta: 'Nombre', valor: ficha ? nombreLegible(ficha.nombre) : usuario.nombre },
    { etiqueta: 'DNI', valor: usuario.dni ?? '' },
    { etiqueta: 'Cargo', valor: ficha?.cargo ?? usuario.cargo },
    { etiqueta: 'Área', valor: ficha?.area ?? '' },
    { etiqueta: 'Sede', valor: ficha?.sede ?? usuario.sede ?? '' },
    { etiqueta: 'Rol en la plataforma', valor: NOMBRE_ROL[usuario.rol ?? 'trabajador'] },
    { etiqueta: 'Usuario de acceso', valor: usuario.correo },
  ].filter((d) => d.valor);

  return (
    <div className="pagina-mi-cuenta">
      <BotonVolver destino={rutaInicialPara(usuario.rol ?? 'trabajador')} />

      <section className="tarjeta-mi-cuenta">
        <div className="tarjeta-mi-cuenta__perfil">
          <Avatar label={obtenerIniciales(usuario.nombre)} shape="circle" size="xlarge" className="tarjeta-mi-cuenta__avatar" />
          <h1>{usuario.nombre}</h1>
          <span>{ficha?.cargo ?? usuario.cargo}</span>
        </div>

        <div className="tarjeta-mi-cuenta__bloque">
          <h2>Datos laborales</h2>
          <dl className="tarjeta-mi-cuenta__datos">
            {laborales.map(({ etiqueta, valor }) => (
              <div key={etiqueta}>
                <dt>{etiqueta}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
          <p className="tarjeta-mi-cuenta__nota">
            <i className="pi pi-lock" aria-hidden="true" />
            Estos datos los registra RR. HH. Si alguno está mal, comunícate con Gestión Humana.
          </p>
        </div>

        <div className="tarjeta-mi-cuenta__bloque">
          <h2>Datos personales</h2>
          {ficha ? (
            <form
              className="tarjeta-mi-cuenta__formulario"
              onSubmit={(e) => {
                e.preventDefault();
                guardar();
              }}
            >
              <label className="tarjeta-mi-cuenta__campo">
                <span>Correo personal</span>
                <InputText
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className={intentado && errores.correo ? 'p-invalid' : ''}
                />
                {intentado && errores.correo && <small className="tarjeta-mi-cuenta__error">{errores.correo}</small>}
              </label>
              <label className="tarjeta-mi-cuenta__campo">
                <span>Teléfono celular</span>
                <InputText
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="987 654 321"
                  className={intentado && errores.telefono ? 'p-invalid' : ''}
                />
                {intentado && errores.telefono && <small className="tarjeta-mi-cuenta__error">{errores.telefono}</small>}
              </label>
              <div className="tarjeta-mi-cuenta__acciones">
                <Button
                  type="button"
                  label="Descartar"
                  text
                  disabled={!cambio}
                  onClick={() => {
                    setCorreo(ficha.correo);
                    setTelefono(ficha.telefono);
                    setIntentado(false);
                  }}
                />
                <Button type="submit" label="Guardar cambios" icon="pi pi-check" className="boton-guardar-perfil" disabled={!cambio} />
              </div>
            </form>
          ) : (
            <p className="tarjeta-mi-cuenta__nota">
              <i className="pi pi-info-circle" aria-hidden="true" />
              Tu cuenta no tiene ficha de trabajador vinculada; tus datos los gestiona el área de Sistemas.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
