import { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import type { Empresa } from '../../dominio/boleta';

interface PropiedadesTarjetaDatosEmpresa {
  empresa: Empresa;
  alGuardar: (empresa: Empresa) => Promise<void>;
}

/** Datos de la empresa que aparecen en el encabezado y en la firma del empleador. */
export function TarjetaDatosEmpresa({ empresa, alGuardar }: PropiedadesTarjetaDatosEmpresa) {
  const [borrador, setBorrador] = useState(empresa);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => setBorrador(empresa), [empresa]);

  const rucValido = /^\d{11}$/.test(borrador.ruc);
  const sinCambios =
    borrador.razonSocial === empresa.razonSocial && borrador.ruc === empresa.ruc && borrador.direccion === empresa.direccion;
  const completo = borrador.razonSocial.trim() !== '' && rucValido;

  const guardar = async () => {
    setGuardando(true);
    try {
      await alGuardar({
        razonSocial: borrador.razonSocial.trim().toUpperCase(),
        ruc: borrador.ruc,
        direccion: borrador.direccion.trim().toUpperCase(),
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="tarjeta-configuracion tarjeta-configuracion--ancha">
      <h2>Datos de la empresa</h2>
      <p className="tarjeta-configuracion__ayuda">Aparecen en el encabezado de la boleta y debajo de la firma del empleador.</p>
      <div className="formulario-empresa">
        <div className="campo">
          <label htmlFor="empresa-razon">Razón social</label>
          <InputText
            id="empresa-razon"
            value={borrador.razonSocial}
            onChange={(e) => setBorrador({ ...borrador, razonSocial: e.target.value })}
          />
        </div>
        <div className="campo">
          <label htmlFor="empresa-ruc">R.U.C.</label>
          <InputText
            id="empresa-ruc"
            value={borrador.ruc}
            inputMode="numeric"
            invalid={borrador.ruc !== '' && !rucValido}
            onChange={(e) => setBorrador({ ...borrador, ruc: e.target.value.replace(/\D/g, '').slice(0, 11) })}
          />
          {borrador.ruc !== '' && !rucValido && <small className="campo__error">El R.U.C. debe tener 11 dígitos.</small>}
        </div>
        <div className="campo formulario-empresa__direccion">
          <label htmlFor="empresa-direccion">Dirección fiscal</label>
          <InputText
            id="empresa-direccion"
            value={borrador.direccion}
            onChange={(e) => setBorrador({ ...borrador, direccion: e.target.value })}
          />
        </div>
      </div>
      <div className="tarjeta-configuracion__acciones">
        <Button
          label="Guardar cambios"
          icon="pi pi-check"
          className="boton-guardar"
          disabled={!completo || sinCambios}
          loading={guardando}
          onClick={() => void guardar()}
        />
      </div>
    </section>
  );
}
