import { totalDescuentos, totalIngresos, netoAPagar, type Boleta, type ConceptoBoleta, type Empresa } from '../dominio/boleta';
import { formatearFechaHora, formatearNumeroBoleta as numero } from '../aplicacion/formato';
import { HojaEscalable } from './HojaEscalable';
import { TrazoFirma } from './TrazoFirma';

interface PropiedadesBoletaDocumento {
  boleta: Boleta;
  empresa: Empresa;
  /** Imagen configurada en "Configuración de boletas"; null si aún no se subió. */
  firmaEmpleador: string | null;
}

interface GrupoConceptos {
  titulo: string;
  conceptos: ConceptoBoleta[];
  columna: 'ingresos' | 'descuentos';
}

/**
 * Boleta de pago con la misma estructura que el PDF oficial de la web existente
 * (backend/src/pdf/pdf.service.ts): cuadrícula con bordes, grupos 01–04 y firmas al pie.
 */
export function BoletaDocumento({ boleta, empresa, firmaEmpleador }: PropiedadesBoletaDocumento) {
  const { detalle } = boleta;
  const grupos: GrupoConceptos[] = [
    { titulo: '01 Ingresos', conceptos: detalle.ingresos, columna: 'ingresos' },
    { titulo: '02 Descuentos', conceptos: detalle.descuentos, columna: 'descuentos' },
    { titulo: '03 Aportes del Trabajador', conceptos: detalle.aportesTrabajador, columna: 'descuentos' },
  ];

  return (
    <HojaEscalable>
      <article className="boleta-pdf" aria-label={`Boleta de pago de ${boleta.trabajador}`}>
        <header className="boleta-pdf__encabezado">
          <img src="/logo-boleta.png" alt="" className="boleta-pdf__logo" />
          <div className="boleta-pdf__empresa">
            <strong>{empresa.razonSocial}</strong>
            <span>R.U.C.: {empresa.ruc}</span>
            {empresa.direccion && <span>{empresa.direccion}</span>}
          </div>
          <strong className="boleta-pdf__numero">BOLETA N° {String(boleta.numero).padStart(6, '0')}</strong>
        </header>
        <h2 className="boleta-pdf__titulo">BOLETA DE PAGO</h2>

        <table className="cuadro">
          <colgroup><col style={{ width: '12%' }} /><col style={{ width: '18%' }} /><col style={{ width: '40%' }} /><col style={{ width: '30%' }} /></colgroup>
          <thead>
            <tr><th colSpan={2} className="a-la-izquierda">DOCUMENTO DE IDENTIDAD</th><th className="a-la-izquierda">APELLIDOS Y NOMBRE</th><th>SITUACIÓN</th></tr>
          </thead>
          <tbody>
            <tr><td className="negrita">DNI</td><td className="mono">{boleta.dni}</td><td className="negrita">{boleta.trabajador}</td><td>{detalle.situacion}</td></tr>
          </tbody>
        </table>

        <table className="cuadro">
          <colgroup><col style={{ width: '12%' }} /><col style={{ width: '12%' }} /><col style={{ width: '20%' }} /><col style={{ width: '28%' }} /><col style={{ width: '28%' }} /></colgroup>
          <thead>
            <tr><th>FEC. INGRESO</th><th>FEC. CESE</th><th>TIPO DE TRABAJADOR</th><th>RÉGIMEN PENSIONARIO</th><th>CUSPP</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>{detalle.fechaIngreso || '-'}</td>
              <td>{detalle.fechaCese}</td>
              <td className="pequeno">{detalle.tipoTrabajador || '-'}</td>
              <td className="pequeno">{detalle.regimenPensionario || '-'}</td>
              <td className="mono pequeno">{detalle.cuspp || '-'}</td>
            </tr>
          </tbody>
        </table>

        <table className="cuadro">
          <colgroup>
            {[14, 14, 13.6, 10.4, 10.4, 10.4, 13.6, 13.6].map((ancho, i) => <col key={i} style={{ width: `${ancho}%` }} />)}
          </colgroup>
          <thead>
            <tr><th colSpan={3}>DÍAS</th><th colSpan={3}>JORNADA ORDINARIA</th><th colSpan={2}>SOBRETIEMPO</th></tr>
            <tr><th>DÍAS LAB.</th><th>DÍAS NO LAB.</th><th>DÍAS SUB.</th><th className="pequeno">CONDICIÓN</th><th>TOTAL HORAS</th><th>MINUTOS</th><th>TOTAL HORAS</th><th>MINUTOS</th></tr>
          </thead>
          <tbody>
            <tr className="mono">
              <td>{detalle.diasLaborados}</td>
              <td>{detalle.diasNoLaborados}</td>
              <td>{detalle.diasSubsidiados}</td>
              <td className="texto pequeno">{detalle.condicion.charAt(0) + detalle.condicion.slice(1).toLowerCase()}</td>
              <td>{detalle.totalHoras}</td>
              <td>{detalle.minutos}</td>
              <td>{detalle.horasSobretiempo}</td>
              <td>{detalle.minutosSobretiempo}</td>
            </tr>
          </tbody>
        </table>

        <table className="cuadro">
          <colgroup><col style={{ width: '50%' }} /><col style={{ width: '50%' }} /></colgroup>
          <tbody>
            <tr><th className="a-la-izquierda">SUELDO BÁSICO</th><td className="mono negrita">{numero(detalle.sueldoBasico)}</td></tr>
          </tbody>
        </table>

        <table className="cuadro">
          <colgroup><col style={{ width: '36%' }} /><col style={{ width: '44%' }} /><col style={{ width: '20%' }} /></colgroup>
          <thead>
            <tr><th>CENTRO DE COSTOS</th><th>OCUPACIÓN</th><th className="pequeno">OTROS EMP. RTA. 5TA. CAT.</th></tr>
          </thead>
          <tbody>
            <tr><td className="pequeno">{detalle.centroCostos}</td><td className="pequeno">{detalle.ocupacion}</td><td className="pequeno">{detalle.otrosEmpleadoresRenta5ta}</td></tr>
          </tbody>
        </table>

        <table className="cuadro">
          <colgroup><col style={{ width: '18%' }} /><col style={{ width: '82%' }} /></colgroup>
          <tbody>
            <tr><th className="a-la-izquierda">PLANILLA</th><td className="negrita a-la-izquierda">{detalle.periodoPlanilla}</td></tr>
          </tbody>
        </table>

        <table className="cuadro conceptos">
          <colgroup><col style={{ width: '50%' }} /><col style={{ width: '15%' }} /><col style={{ width: '17.4%' }} /><col style={{ width: '17.6%' }} /></colgroup>
          <thead>
            <tr><th className="a-la-izquierda">CONCEPTO</th><th>MOVIM.</th><th>INGRESOS S/</th><th>DESCUENTOS</th></tr>
          </thead>
          {grupos.map(({ titulo, conceptos, columna }) => (
            <tbody key={titulo}>
              <tr className="conceptos__grupo"><td colSpan={4}>{titulo}</td></tr>
              {conceptos.map(({ concepto, monto, movimiento }) => (
                <tr key={concepto} className="conceptos__fila">
                  <td className="conceptos__nombre">{concepto}</td>
                  <td className="mono">{movimiento ?? ''}</td>
                  <td className="mono importe">{columna === 'ingresos' ? numero(monto) : ''}</td>
                  <td className="mono importe">{columna === 'descuentos' ? numero(monto) : ''}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>

        <table className="cuadro totales">
          <colgroup><col style={{ width: '65%' }} /><col style={{ width: '17.4%' }} /><col style={{ width: '17.6%' }} /></colgroup>
          <tbody>
            <tr>
              <td className="negrita a-la-izquierda">IMPORTE TOTAL</td>
              <td className="negrita importe">{numero(totalIngresos(boleta))}</td>
              <td className="negrita importe">{numero(totalDescuentos(boleta))}</td>
            </tr>
          </tbody>
        </table>

        <div className="importe-neto">
          <span>TOTAL A PAGAR: S/.</span>
          <strong>{numero(netoAPagar(boleta))}</strong>
        </div>

        <section className="aportes-empleador">
          <h3>04 Aportes del Empleador</h3>
          {detalle.aportesEmpleador.map(({ concepto, monto }) => (
            <p key={concepto}>
              <span>{concepto}:</span>
              <span className="mono">{numero(monto)}</span>
            </p>
          ))}
        </section>

        <footer className="boleta-pdf__firmas">
          <div className="firma-pdf">
            <div className="firma-pdf__imagen">
              {firmaEmpleador ? (
                <img src={firmaEmpleador} alt={`Firma de ${empresa.razonSocial}`} className="firma-pdf__imagen-empleador" />
              ) : (
                <span className="firma-pdf__pendiente">Firma no configurada</span>
              )}
            </div>
            <strong>{empresa.razonSocial}</strong>
            <span>R.U.C.: {empresa.ruc}</span>
            <span>Empleador</span>
          </div>
          <div className="firma-pdf">
            <div className="firma-pdf__imagen">
              {boleta.fechaFirma ? (
                <TrazoFirma etiqueta={`Firma de ${boleta.trabajador}`} />
              ) : (
                <span className="firma-pdf__pendiente">Pendiente de firma</span>
              )}
            </div>
            <strong>{boleta.trabajador}</strong>
            <span>DNI: {boleta.dni}</span>
            <span className="negrita">Colaborador</span>
            {boleta.fechaFirma && (
              <span className="firma-pdf__fecha">Firmado el {formatearFechaHora(boleta.fechaFirma)}</span>
            )}
          </div>
        </footer>

        <p className="boleta-pdf__pagina">Página 1 de 1</p>
      </article>
    </HojaEscalable>
  );
}
