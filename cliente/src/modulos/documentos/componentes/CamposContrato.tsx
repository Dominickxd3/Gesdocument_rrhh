import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { fechaLarga } from '@/compartido/almacen/crearAlmacen';
import { montoSoles } from '@/compartido/formato/montos';
import { esCargoVentas } from '../dominio/plantillaAdenda';
import { ASIGNACION_FAMILIAR, MESES_CONTRATO, calcularHasta, esCargoConfianza, funcionesSugeridas } from '../dominio/plantillaContrato';

/** Lo que RR. HH. completa para el contrato; nombre, DNI y domicilio salen de la ficha. */
export interface FormularioContrato {
  cargo: string;
  confianza: boolean;
  meses: number;
  desde: string;
  remuneracion: number | null;
  asignacionFamiliar: boolean;
  horario1: string;
  horario2: string;
  /** Una función por línea. */
  funciones: string;
  adendaVendedor: boolean;
}

export const contratoInicial = (cargo: string, remuneracion: number | null, hoy: string): FormularioContrato => ({
  cargo: cargo.toUpperCase(),
  confianza: esCargoConfianza(cargo),
  meses: 3,
  desde: hoy,
  remuneracion,
  asignacionFamiliar: false,
  horario1: 'de Lunes a Viernes de 7:00 a.m. a 4:00 p.m.',
  horario2: 'Sábados de 7:00 a.m. a 4:00 p.m.',
  funciones: funcionesSugeridas(cargo).join('\n'),
  adendaVendedor: esCargoVentas(cargo),
});

export const contratoCompleto = (f: FormularioContrato) => !!(f.cargo.trim() && f.desde && (f.remuneracion ?? 0) > 0 && f.horario1.trim());

/** Campos del contrato por incremento de actividad (equivalen a los campos de combinación del Word). */
export function CamposContrato({ valor, alCambiar }: { valor: FormularioContrato; alCambiar: (v: FormularioContrato) => void }) {
  const cambiar = (c: Partial<FormularioContrato>) => alCambiar({ ...valor, ...c });
  const hasta = valor.desde ? calcularHasta(valor.desde, valor.meses) : '';

  return (
    <section className="pp-seccion">
      <h3 className="pp-seccion__titulo">
        <span>
          <i className="pi pi-file-edit" aria-hidden="true" />
        </span>{' '}
        Datos del contrato
      </h3>

      <label className="pp-campo">
        <span className="pp-campo__etiqueta">Cargo *</span>
        <InputText
          value={valor.cargo}
          onChange={(e) => {
            const cargo = e.target.value.toUpperCase();
            // Al cambiar el cargo se proponen su condición de confianza y sus funciones.
            cambiar({ cargo, confianza: esCargoConfianza(cargo), funciones: funcionesSugeridas(cargo).join('\n'), adendaVendedor: esCargoVentas(cargo) });
          }}
        />
      </label>
      <label className="pp-interruptor">
        <InputSwitch checked={valor.confianza} onChange={(e) => cambiar({ confianza: !!e.value })} />
        Cargo de confianza (art. 43 del D.L. 728)
      </label>
      <label className="pp-interruptor">
        <InputSwitch checked={valor.adendaVendedor} onChange={(e) => cambiar({ adendaVendedor: !!e.value })} />
        Incluir adenda de obligaciones del vendedor (página adicional para firmar)
      </label>

      <div className="dm-rejilla-fechas">
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Desde *</span>
          <input type="date" className="p-inputtext" value={valor.desde} onChange={(e) => cambiar({ desde: e.target.value })} />
        </label>
        <label className="pp-campo">
          <span className="pp-campo__etiqueta">Duración</span>
          <Dropdown value={valor.meses} options={MESES_CONTRATO.map((m) => ({ label: `${m} ${m === 1 ? 'mes' : 'meses'}`, value: m }))} onChange={(e) => cambiar({ meses: e.value })} />
        </label>
        <div className={`pp-duracion${hasta ? ' tiene-valor' : ''}`}>
          <span>Hasta</span>
          <strong>{hasta ? fechaLarga(hasta) : '—'}</strong>
        </div>
      </div>

      <div className="pp-campo">
        <span className="pp-campo__etiqueta">Remuneración mensual *</span>
        <InputNumber value={valor.remuneracion} onValueChange={(e) => cambiar({ remuneracion: e.value ?? null })} mode="currency" currency="PEN" locale="es-PE" min={0} />
        {!!valor.remuneracion && <small className="pp-campo__ayuda">En el contrato: {montoSoles(valor.remuneracion)}</small>}
      </div>
      <label className="pp-interruptor">
        <InputSwitch checked={valor.asignacionFamiliar} onChange={(e) => cambiar({ asignacionFamiliar: !!e.value })} />
        Asignación familiar (S/ {ASIGNACION_FAMILIAR.toFixed(2)})
      </label>

      <label className="pp-campo">
        <span className="pp-campo__etiqueta">Horario 1 *</span>
        <InputText value={valor.horario1} onChange={(e) => cambiar({ horario1: e.target.value })} />
      </label>
      <label className="pp-campo">
        <span className="pp-campo__etiqueta">Horario 2</span>
        <InputText value={valor.horario2} onChange={(e) => cambiar({ horario2: e.target.value })} placeholder="Opcional" />
      </label>

      <label className="pp-campo">
        <span className="pp-campo__etiqueta">Funciones del cargo (una por línea)</span>
        <InputTextarea value={valor.funciones} onChange={(e) => cambiar({ funciones: e.target.value })} rows={6} />
        <small className="pp-campo__ayuda">Se insertan en la cláusula quinta, entre las obligaciones comunes a todos los cargos.</small>
      </label>
    </section>
  );
}
