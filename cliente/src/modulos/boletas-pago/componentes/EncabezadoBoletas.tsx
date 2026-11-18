import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { NOMBRES_MESES, clavePeriodo, nombrePeriodo, type Periodo } from '../dominio/boleta';

interface PropiedadesEncabezadoBoletas {
  periodos: Periodo[];
  periodo: Periodo;
  cargando: boolean;
  alCambiarPeriodo: (clave: string) => void;
  alRecargar: () => void;
}

export function EncabezadoBoletas({
  periodos,
  periodo,
  cargando,
  alCambiarPeriodo,
  alRecargar,
}: PropiedadesEncabezadoBoletas) {
  const enCurso = periodo.estado === 'en_curso';
  const anios = [...new Set(periodos.map((p) => p.anio))];
  const meses = periodos
    .filter((p) => p.anio === periodo.anio)
    .sort((a, b) => a.mes - b.mes)
    .map((p) => ({
      etiqueta: `${NOMBRES_MESES[p.mes - 1]}${p.estado === 'en_curso' ? ' (En curso)' : ''}`,
      valor: p.mes,
    }));

  const cambiarAnio = (anio: number) => {
    // Conserva el mes si existe en el nuevo año; si no, toma el más reciente disponible.
    const delAnio = periodos.filter((p) => p.anio === anio);
    const destino = delAnio.find((p) => p.mes === periodo.mes) ?? delAnio[0];
    if (destino) alCambiarPeriodo(clavePeriodo(destino));
  };

  return (
    <header className="encabezado-boletas">
      <div>
        <div className="encabezado-boletas__titulo">
          <h1>Boletas de pago</h1>
          <span className={`insignia-periodo ${enCurso ? 'es-en-curso' : 'es-cerrado'}`}>
            <i className={enCurso ? 'pi pi-lock' : 'pi pi-check-circle'} aria-hidden="true" />
            {enCurso ? 'Periodo en curso – envío masivo bloqueado' : 'Periodo cerrado'}
          </span>
        </div>
        <p className="encabezado-boletas__subtitulo">{nombrePeriodo(periodo)}</p>
      </div>

      <div className="encabezado-boletas__acciones">
        <Dropdown
          value={periodo.anio}
          options={anios}
          onChange={(e) => cambiarAnio(e.value as number)}
          aria-label="Año"
          className="selector-anio"
        />
        <Dropdown
          value={periodo.mes}
          options={meses}
          optionLabel="etiqueta"
          optionValue="valor"
          onChange={(e) => alCambiarPeriodo(clavePeriodo({ anio: periodo.anio, mes: e.value as number }))}
          aria-label="Mes"
          className="selector-mes"
          scrollHeight="320px"
        />
        <Button
          icon="pi pi-refresh"
          outlined
          className="boton-secundario boton-cuadrado"
          aria-label="Actualizar"
          title="Actualizar"
          loading={cargando}
          onClick={alRecargar}
        />
      </div>
    </header>
  );
}
