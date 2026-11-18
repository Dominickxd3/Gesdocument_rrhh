import { Button } from 'primereact/button';

interface PropiedadesTarjetaFirmaActual {
  firma: string | null;
  alEliminar: () => void;
}

export function TarjetaFirmaActual({ firma, alEliminar }: PropiedadesTarjetaFirmaActual) {
  return (
    <section className="tarjeta-configuracion">
      <h2>Imagen actual</h2>
      <div className={`vista-firma${firma ? '' : ' es-vacia'}`}>
        {firma ? <img src={firma} alt="Firma del representante legal" /> : <span>Aún no se ha cargado una firma</span>}
      </div>
      {firma && (
        <Button label="Eliminar" icon="pi pi-trash" className="boton-eliminar" onClick={alEliminar} />
      )}
    </section>
  );
}
