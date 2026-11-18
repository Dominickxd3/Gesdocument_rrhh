import type { ResumenBoletas } from '../dominio/boleta';

export function TarjetasResumen({ resumen }: { resumen: ResumenBoletas }) {
  const tarjetas = [
    { etiqueta: 'Total boletas', valor: resumen.total, icono: 'pi pi-file' },
    { etiqueta: 'Firmadas', valor: resumen.firmadas, icono: 'pi pi-verified' },
  ];

  return (
    <div className="tarjetas-resumen">
      {tarjetas.map(({ etiqueta, valor, icono }) => (
        <article key={etiqueta} className="tarjeta-resumen">
          <span className="tarjeta-resumen__icono">
            <i className={icono} aria-hidden="true" />
          </span>
          <div>
            <span className="tarjeta-resumen__etiqueta">{etiqueta}</span>
            <strong className="tarjeta-resumen__valor">{valor}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}
