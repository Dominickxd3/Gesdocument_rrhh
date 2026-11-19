import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { SUSTENTOS, diasPeriodo, type Descanso, type TipoSustento } from '../dominio/descanso';
import { archivoSubido } from '../aplicacion/almacenDescansos';

interface Propiedades {
  descanso: Descanso | null;
  tipo: TipoSustento | null;
  /** RR. HH. ve el diagnóstico; el trabajador también ve su propio documento completo. */
  alCerrar: () => void;
}

const formatoFecha = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fecha = (iso: string) => formatoFecha.format(new Date(`${iso}T12:00:00`));

/** Documento de ejemplo para los sustentos ficticios (no tienen archivo real). */
function DocumentoEjemplo({ d, tipo }: { d: Descanso; tipo: TipoSustento }) {
  const esCertificado = tipo === 'certificado';
  return (
    <article className="dm-documento">
      <span className="dm-documento__marca">Documento de ejemplo</span>
      <header>
        <strong>{d.centroMedico || 'Centro médico'}</strong>
        <h3>{esCertificado ? 'CERTIFICADO MÉDICO' : 'CONSTANCIA DE ATENCIÓN'}</h3>
      </header>
      <p>
        Se certifica que el(la) paciente <strong>{d.trabajador.nombre}</strong>, identificado(a) con DNI{' '}
        <strong>{d.trabajador.dni}</strong>, fue atendido(a) en este establecimiento
        {esCertificado ? (
          <>
            {' '}y requiere descanso médico por <strong>{diasPeriodo(d.inicio, d.fin)} día(s)</strong>, del{' '}
            <strong>{fecha(d.inicio)}</strong> al <strong>{fecha(d.fin)}</strong>.
          </>
        ) : (
          <> el día <strong>{fecha(d.inicio)}</strong>.</>
        )}
      </p>
      <p>
        Diagnóstico: <strong>{d.diagnostico || '—'}</strong>
      </p>
      <footer>
        <div className="dm-documento__firma">
          <span />
          Firma y sello del médico tratante
          <small>CMP 000000</small>
        </div>
      </footer>
    </article>
  );
}

/** Ventana centrada para ver un sustento: el archivo subido o, en los datos ficticios, un ejemplo. */
export function VentanaDocumento({ descanso: d, tipo, alCerrar }: Propiedades) {
  const nombre = d && tipo ? d.sustentos[tipo] : undefined;
  const archivo = nombre ? archivoSubido(nombre) : undefined;
  const etiqueta = SUSTENTOS.find((s) => s.tipo === tipo)?.etiqueta ?? 'Documento';

  return (
    <Dialog
      visible={!!(d && tipo && nombre)}
      onHide={alCerrar}
      header={
        <div className="pp-ventana__titulo">
          <span>{etiqueta}</span>
          <small>{nombre}</small>
        </div>
      }
      className="pp-ventana dm-ventana-documento"
      style={{ width: '820px' }}
      breakpoints={{ '860px': '100vw' }}
      draggable={false}
      footer={
        <div className="pp-ventana__pie">
          {archivo && (
            <Button
              label="Abrir en otra pestaña"
              icon="pi pi-external-link"
              text
              onClick={() => window.open(archivo.url, '_blank', 'noopener')}
            />
          )}
          <span className="pp-espaciador" />
          <Button label="Cerrar" className="pp-boton-principal" onClick={alCerrar} />
        </div>
      }
    >
      <div className="dm-visor">
        {d && tipo && archivo ? (
          archivo.tipo.startsWith('image/') ? (
            <img src={archivo.url} alt={etiqueta} />
          ) : (
            <iframe src={archivo.url} title={etiqueta} />
          )
        ) : (
          d && tipo && <DocumentoEjemplo d={d} tipo={tipo} />
        )}
      </div>
    </Dialog>
  );
}
