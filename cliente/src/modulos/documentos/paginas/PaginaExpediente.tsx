import { useAviso } from '@/compartido/notificaciones/notificaciones';
import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { BotonVolver } from '@/compartido/componentes/BotonVolver';
import { hoyIso } from '@/compartido/almacen/crearAlmacen';
import '@/compartido/estilos/listados';
import { useTrabajadores } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { contratoEjemplo, corregirDocumento, crearDocumento, enviarAFirma, useDocumentos } from '../aplicacion/almacenDocumentos';
import type { TipoDocumento } from '../dominio/documento';
import { ExpedienteTrabajador } from '../componentes/ExpedienteTrabajador';
import { VentanaDocumento } from '../componentes/VentanaDocumento';
import { VentanaNuevoDocumento } from '../componentes/VentanaNuevoDocumento';

/** Inicio del contrato: la fecha de ingreso si es de los últimos 30 días; si no, hoy. */
function inicioContrato(fechaIngreso: string) {
  const hoy = hoyIso();
  const dias = (Date.parse(hoy) - Date.parse(fechaIngreso.slice(0, 10))) / 86_400_000;
  return dias >= 0 && dias <= 30 ? fechaIngreso.slice(0, 10) : hoy;
}

/** RR. HH. (CUS40–CUS44, CUS47): expediente digital de un trabajador. */
export function PaginaExpediente() {
  const { dni } = useParams();
  const usuario = useUsuarioActual();
  const trabajador = useTrabajadores().find((t) => t.dni === dni);
  const documentos = useDocumentos().filter((d) => d.dni === dni);
  const aviso = useAviso();
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState<{ tipo?: TipoDocumento } | null>(null);

  if (!trabajador) return <Navigate to="/documentos" replace />;

  const detalle = documentos.find((d) => d.id === idDetalle) ?? null;
  const avisar = (summary: string, detail?: string) => aviso.current?.show({ severity: 'success', summary, detail, life: 3000 });

  return (
    <div className="pagina-papeletas">
      <BotonVolver destino="/documentos" etiqueta="Volver a expedientes" />
      <header className="pp-encabezado">
        <h1>Expediente digital</h1>
        <div className="pp-encabezado__acciones">
          <Button label="Nuevo documento" icon="pi pi-plus" className="pp-boton-principal" onClick={() => setNuevo({})} />
        </div>
      </header>

      <ExpedienteTrabajador
        ficha={trabajador}
        documentos={documentos}
        modo="rrhh"
        alAbrir={(d) => setIdDetalle(d.id)}
        alPreparar={(tipo) => setNuevo({ tipo })}
        alPrepararIngreso={(faltan) => {
          // Expediente de ingreso: todo sale de los modelos de Gestión Humana con los datos de la ficha y se envía a firma.
          // El contrato toma el cargo, la remuneración y la fecha de ingreso de la ficha (3 meses, horario estándar).
          faltan.forEach((tipo) =>
            crearDocumento(
              {
                dni: trabajador.dni,
                trabajador: trabajador.nombre,
                tipo,
                origen: { tipo: 'plantilla' },
                // Ingreso reciente (últimos 30 días): el contrato empieza en su fecha de ingreso; si no, desde hoy.
                contrato: tipo === 'contrato' ? contratoEjemplo(trabajador, inicioContrato(trabajador.fechaIngreso)) : undefined,
              },
              usuario.nombre,
              true,
            ),
          );
          avisar(`${faltan.length} documento${faltan.length > 1 ? 's' : ''} enviado${faltan.length > 1 ? 's' : ''} para firma`, 'El trabajador los verá en "Mi expediente".');
        }}
      />

      <VentanaDocumento
        documento={detalle}
        modo="rrhh"
        alCerrar={() => setIdDetalle(null)}
        alEnviar={(d) => {
          enviarAFirma(d, usuario.nombre);
          avisar('Documento enviado', 'El trabajador lo verá en "Mi expediente".');
        }}
        alCorregir={(d, archivo) => {
          corregirDocumento(d, usuario.nombre, archivo);
          avisar('Corrección enviada', 'El documento volvió a firma.');
        }}
      />

      <VentanaNuevoDocumento
        visible={!!nuevo}
        dniInicial={trabajador.dni}
        tipoInicial={nuevo?.tipo}
        alCerrar={() => setNuevo(null)}
        alCrear={(datos, enviar) => {
          crearDocumento(datos, usuario.nombre, enviar);
          setNuevo(null);
          avisar(`Documento ${enviar ? 'enviado para firma' : 'guardado en preparación'}`);
        }}
      />
    </div>
  );
}
