import { useAviso } from '@/compartido/notificaciones/notificaciones';
import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { BotonVolver } from '@/compartido/componentes/BotonVolver';
import '@/compartido/estilos/listados';
import { useTrabajadores } from '@/modulos/trabajadores/aplicacion/almacenTrabajadores';
import { corregirDocumento, crearDocumento, enviarAFirma, useDocumentos } from '../aplicacion/almacenDocumentos';
import type { TipoDocumento } from '../dominio/documento';
import { ExpedienteTrabajador } from '../componentes/ExpedienteTrabajador';
import { VentanaDocumento } from '../componentes/VentanaDocumento';
import { VentanaNuevoDocumento } from '../componentes/VentanaNuevoDocumento';

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
      />

      <VentanaDocumento
        documento={detalle}
        modo="rrhh"
        alCerrar={() => setIdDetalle(null)}
        alEnviar={(d) => {
          enviarAFirma(d, usuario.nombre);
          avisar(`Documento N° ${d.numero} enviado`, 'El trabajador lo verá en "Mi expediente".');
        }}
        alCorregir={(d, archivo) => {
          corregirDocumento(d, usuario.nombre, archivo);
          avisar(`Versión ${d.version + 1} enviada`, 'El documento volvió a firma.');
        }}
      />

      <VentanaNuevoDocumento
        visible={!!nuevo}
        dniInicial={trabajador.dni}
        tipoInicial={nuevo?.tipo}
        alCerrar={() => setNuevo(null)}
        alCrear={(datos, enviar) => {
          const numero = crearDocumento(datos, usuario.nombre, enviar);
          setNuevo(null);
          avisar(`Documento N° ${numero} ${enviar ? 'enviado para firma' : 'guardado en preparación'}`);
        }}
      />
    </div>
  );
}
