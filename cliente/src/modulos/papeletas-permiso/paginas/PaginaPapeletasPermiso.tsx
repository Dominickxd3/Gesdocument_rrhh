import { useMemo, useRef, useState } from 'react';
import { useUsuarioActual } from '@/compartido/sesion/ContextoSesion';
import { esGestor } from '@/compartido/sesion/tipos';
import { PaginaMisPapeletas } from './PaginaMisPapeletas';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { usePapeletas } from '../aplicacion/usePapeletas';
import { AREAS } from '../infraestructura/datosPrueba';
import type { DatosPapeleta, Papeleta } from '../dominio/papeleta';
import { BarraFiltros } from '../componentes/BarraFiltros';
import { TablaPapeletas } from '../componentes/TablaPapeletas';
import { PanelDetalle } from '../componentes/PanelDetalle';
import { VentanaFormulario } from '../componentes/VentanaFormulario';
import { VentanaRechazo } from '../componentes/VentanaRechazo';
import { VentanaImpresion } from '../componentes/VentanaImpresion';
import '../componentes/papeletas.css';

/** RR. HH. revisa y aprueba todas; el colaborador solo ve las suyas (RNF01). */
export function PaginaPapeletasPermiso() {
  const usuario = useUsuarioActual();
  return esGestor(usuario) ? <PapeletasRrhh /> : <PaginaMisPapeletas />;
}

/** Prototipo de diseño (media fidelidad). Datos ficticios en memoria. */
function PapeletasRrhh() {
  const pp = usePapeletas();
  const aviso = useRef<Toast>(null);

  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<{ visible: boolean; papeleta: Papeleta | null }>({ visible: false, papeleta: null });
  const [aRechazar, setARechazar] = useState<Papeleta[]>([]);
  const [aImprimir, setAImprimir] = useState<Papeleta | null>(null);

  const detalle = useMemo(() => pp.papeletas.find((p) => p.id === idDetalle) ?? null, [pp.papeletas, idDetalle]);
  const siguienteNumero = Math.max(0, ...pp.papeletas.map((p) => p.numero)) + 1;

  const avisar = (summary: string, detail?: string, severity: 'success' | 'info' = 'success') =>
    aviso.current?.show({ severity, summary, detail, life: 3000 });

  const aprobar = (lista: Papeleta[]) => {
    pp.aprobar(lista.map((p) => p.id));
    avisar(lista.length === 1 ? `Papeleta #${lista[0].numero} aprobada` : `${lista.length} papeletas aprobadas`);
  };

  const rechazar = (motivo: string) => {
    pp.rechazar(aRechazar.map((p) => p.id), motivo);
    avisar(aRechazar.length === 1 ? `Papeleta #${aRechazar[0].numero} rechazada` : `${aRechazar.length} papeletas rechazadas`, motivo);
    setARechazar([]);
  };

  const anular = (p: Papeleta) =>
    confirmDialog({
      header: `Anular papeleta #${p.numero}`,
      message: 'Quedará como anulada y no contará en reportes. Podrás restaurarla después.',
      icon: 'pi pi-ban',
      acceptLabel: 'Sí, anular',
      rejectLabel: 'Cancelar',
      acceptClassName: 'pp-boton-rechazar-lleno',
      rejectClassName: 'p-button-text',
      accept: () => {
        pp.anular(p.id);
        avisar(`Papeleta #${p.numero} anulada`, undefined, 'info');
      },
    });

  const guardar = (datos: DatosPapeleta) => {
    const numero = pp.guardar(datos, formulario.papeleta?.id);
    setFormulario({ visible: false, papeleta: null });
    avisar(formulario.papeleta ? `Papeleta #${numero} actualizada` : `Papeleta #${numero} registrada`, 'Queda pendiente de aprobación.');
  };

  return (
    <div className="pagina-papeletas">
      <Toast ref={aviso} position="bottom-right" />
      <ConfirmDialog />

      <header className="pp-encabezado">
        <div>
          <h1>Papeletas de permiso</h1>
        </div>
        <div className="pp-encabezado__acciones">
          <Button label="Exportar" icon="pi pi-download" outlined className="pp-boton-secundario" onClick={() => avisar('Exportación simulada', 'En producción descargará un Excel con los filtros actuales.', 'info')} />
          <Button label="Nueva papeleta" icon="pi pi-plus" className="pp-boton-principal" onClick={() => setFormulario({ visible: true, papeleta: null })} />
        </div>
      </header>

      <BarraFiltros filtros={pp.filtros} areas={AREAS} conteo={pp.conteoEstados} alCambiar={pp.actualizarFiltros} />

      <TablaPapeletas
        papeletas={pp.visibles}
        seleccion={pp.seleccion}
        alSeleccionar={pp.setSeleccion}
        alAbrir={(p) => setIdDetalle(p.id)}
        alAprobar={(p) => aprobar([p])}
        alRechazar={(p) => setARechazar([p])}
        alLimpiarFiltros={pp.limpiarFiltros}
      />

      {pp.seleccion.length > 0 && (
        <div className="pp-barra-seleccion" role="region" aria-label="Acciones en lote">
          <strong>{pp.seleccion.length} seleccionadas</strong>
          <Button label="Rechazar" icon="pi pi-times" outlined size="small" className="pp-boton-rechazar" onClick={() => setARechazar(pp.seleccion)} />
          <Button label="Aprobar" icon="pi pi-check" size="small" className="pp-boton-aprobar" onClick={() => aprobar(pp.seleccion)} />
          <Button icon="pi pi-times" text rounded size="small" aria-label="Quitar selección" onClick={() => pp.setSeleccion([])} />
        </div>
      )}

      <PanelDetalle
        papeleta={detalle}
        alCerrar={() => setIdDetalle(null)}
        alAprobar={(p) => aprobar([p])}
        alRechazar={(p) => setARechazar([p])}
        alEditar={(p) => setFormulario({ visible: true, papeleta: p })}
        alAnular={anular}
        alRestaurar={(p) => {
          pp.restaurar(p.id);
          avisar(`Papeleta #${p.numero} restaurada`, 'Volvió a pendiente.', 'info');
        }}
        alImprimir={setAImprimir}
      />

      <VentanaFormulario
        visible={formulario.visible}
        papeleta={formulario.papeleta}
        siguienteNumero={siguienteNumero}
        alCerrar={() => setFormulario({ visible: false, papeleta: null })}
        alGuardar={guardar}
      />

      <VentanaRechazo cantidad={aRechazar.length} alCerrar={() => setARechazar([])} alConfirmar={rechazar} />

      <VentanaImpresion papeleta={aImprimir} alCerrar={() => setAImprimir(null)} />
    </div>
  );
}
