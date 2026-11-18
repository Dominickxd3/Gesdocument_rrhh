import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { nombrePeriodo, type Boleta, type ConfiguracionBoletas, type Periodo } from '../dominio/boleta';
import { BoletaDocumento } from './BoletaDocumento';
import { InsigniaEnvio, InsigniaEstado } from './EstadoBoleta';

interface PropiedadesVentanaBoleta {
  boleta: Boleta | null;
  configuracion: ConfiguracionBoletas;
  periodo: Periodo;
  enviando: boolean;
  alCerrar: () => void;
  alEnviar: (boleta: Boleta) => void;
  alCopiarEnlace: (boleta: Boleta) => void;
  alRevertirFirma: (boleta: Boleta) => void;
}

/** Ventana centrada con el documento de la boleta y sus acciones. */
export function VentanaBoleta({
  boleta,
  configuracion,
  periodo,
  enviando,
  alCerrar,
  alEnviar,
  alCopiarEnlace,
  alRevertirFirma,
}: PropiedadesVentanaBoleta) {
  const encabezado = boleta && (
    <div className="ventana-boleta__encabezado">
      <span className="ventana-boleta__titulo">Boleta de pago · {nombrePeriodo(periodo)}</span>
      <span className="ventana-boleta__insignias">
        <InsigniaEstado boleta={boleta} />
        <InsigniaEnvio boleta={boleta} />
      </span>
    </div>
  );

  const pie = boleta && (
    <div className="ventana-boleta__pie">
      {boleta.firma === 'firmada' ? (
        <Button
          label="Revertir firma"
          icon="pi pi-replay"
          outlined
          className="boton-secundario"
          onClick={() => alRevertirFirma(boleta)}
        />
      ) : (
        <>
          <Button
            label="Copiar enlace"
            icon="pi pi-link"
            outlined
            className="boton-secundario"
            onClick={() => alCopiarEnlace(boleta)}
          />
          <Button
            label={boleta.estadoEnvio === 'enviado' ? 'Reenviar al colaborador' : 'Enviar al colaborador'}
            icon="pi pi-send"
            className="boton-principal"
            loading={enviando}
            onClick={() => alEnviar(boleta)}
          />
        </>
      )}
    </div>
  );

  return (
    <Dialog
      visible={!!boleta}
      onHide={alCerrar}
      header={encabezado}
      footer={pie}
      modal
      dismissableMask
      draggable={false}
      resizable={false}
      className="ventana-boleta"
      style={{ width: '880px' }}
      breakpoints={{ '960px': '94vw', '640px': '100vw' }}
    >
      {boleta && (
        <BoletaDocumento boleta={boleta} empresa={configuracion.empresa} firmaEmpleador={configuracion.firmaEmpleador} />
      )}
    </Dialog>
  );
}
