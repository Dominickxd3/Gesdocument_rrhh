import { useMemo, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Insignia } from '@/compartido/componentes/Insignia';
import '@/modulos/descansos-medicos/componentes/descansos.css';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { TablaListado } from '@/compartido/componentes/TablaListado';
import { fechaLarga } from '@/compartido/almacen/crearAlmacen';
import '@/compartido/estilos/listados';
import '@/modulos/documentos/componentes/expediente.css';
import { firmarPapeleta, usePapeletasCompartidas } from '../aplicacion/almacenPapeletas';
import { etiquetaTipo, faltaFirmaColaborador, puedeImprimir, type Papeleta, numeroPapeleta } from '../dominio/papeleta';
import { Horario, InsigniaEstado } from '../componentes/Insignias';
import { VentanaMiPapeleta } from '../componentes/VentanaMiPapeleta';
import '../componentes/papeletas.css';

/** Nota del último rechazo o anulación, para que el colaborador sepa por qué. */
const notaDe = (p: Papeleta) => [...p.historial].reverse().find((h) => h.nota)?.nota;

/**
 * Vista del colaborador (RNF01): solo sus papeletas. Las registra su jefe inmediato y las aprueba RR. HH.;
 * aquí ve en qué estado están e imprime las aprobadas.
 */
export function PaginaMisPapeletas() {
  const usuario = useUsuarioActual();
  const papeletas = usePapeletasCompartidas();
  const aviso = useRef<Toast>(null);
  // Se guarda el id: así la ventana muestra la papeleta actualizada al firmarla.
  const [idAbierta, setIdAbierta] = useState<string | null>(null);
  const setAImprimir = (p: Papeleta | null) => setIdAbierta(p?.id ?? null);

  const mias = useMemo(
    () => papeletas.filter((p) => p.trabajador.dni === usuario.dni).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.numero - a.numero),
    [papeletas, usuario.dni],
  );
  const abierta = mias.find((p) => p.id === idAbierta) ?? null;
  const porFirmar = mias.filter(faltaFirmaColaborador);

  const accion = (p: Papeleta) =>
    puedeImprimir(p) ? (
      <Button
        label={faltaFirmaColaborador(p) ? 'Firmar papeleta' : 'Ver papeleta'}
        icon={faltaFirmaColaborador(p) ? 'pi pi-pencil' : 'pi pi-eye'}
        size="small"
        outlined
        className="pp-boton-secundario"
        onClick={(e) => {
          e.stopPropagation();
          setAImprimir(p);
        }}
      />
    ) : null;

  return (
    <div className="pagina-papeletas">
      <header className="pp-encabezado">
        <div>
          <h1>Mis papeletas</h1>
          <p className="dm-subtitulo">Tu jefe inmediato registra la papeleta y RR. HH. la aprueba. Las aprobadas se muestran en vigilancia al salir.</p>
        </div>
      </header>

      {porFirmar.length > 0 && (
        <button type="button" className="dm-pendiente-trabajador" onClick={() => setAImprimir(porFirmar[0])}>
          <i className="pi pi-pencil" aria-hidden="true" />
          <span>
            RR. HH. aprobó {porFirmar.length === 1 ? 'tu papeleta' : `${porFirmar.length} papeletas`}. Fírmala para mostrarla en vigilancia.
          </span>
          <i className="pi pi-angle-right" aria-hidden="true" />
        </button>
      )}

      <TablaListado
        datos={mias}
        clave="id"
        nombrePlural="papeletas"
        vacio="Aún no tienes papeletas de permiso."
        alAbrir={(p) => puedeImprimir(p) && setAImprimir(p)}
      >
        <Column header="N°" body={(p: Papeleta) => <strong>{numeroPapeleta(p.numero)}</strong>} className="pp-col-fecha" />
        <Column header="Fecha" body={(p: Papeleta) => fechaLarga(p.fecha)} />
        <Column
          header="Motivo"
          body={(p: Papeleta) => (
            <div className="mp-motivo">
              <span>{p.motivo}</span>
              <small>{etiquetaTipo(p.tipo)}</small>
            </div>
          )}
        />
        <Column header="Horario" body={(p: Papeleta) => <Horario papeleta={p} />} />
        <Column
          header="Estado"
          body={(p: Papeleta) => (
            <div className="mp-motivo">
              <InsigniaEstado estado={p.estado} />
              {faltaFirmaColaborador(p) && <Insignia tono="ambar">Por firmar</Insignia>}
              {(p.estado === 'rechazada' || p.estado === 'anulada') && notaDe(p) && <small>{notaDe(p)}</small>}
            </div>
          )}
          className="pp-col-estado"
        />
        <Column body={accion} className="cs-col-accion" />
      </TablaListado>

      <Toast ref={aviso} position="bottom-right" />
      <VentanaMiPapeleta
        papeleta={abierta}
        alCerrar={() => setIdAbierta(null)}
        alFirmar={(p, imagen) => {
          firmarPapeleta(p.id, imagen);
          aviso.current?.show({ severity: 'success', summary: `Papeleta N° ${numeroPapeleta(p.numero)} firmada`, detail: 'Ya puedes mostrarla en vigilancia.', life: 3000 });
        }}
      />
    </div>
  );
}
