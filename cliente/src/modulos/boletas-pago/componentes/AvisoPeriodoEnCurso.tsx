export function AvisoPeriodoEnCurso() {
  return (
    <div className="aviso-periodo" role="status">
      <i className="pi pi-exclamation-triangle" aria-hidden="true" />
      <div>
        <strong>Periodo en curso – envío masivo bloqueado</strong>
        <p>
          Las boletas de este periodo están disponibles para consulta y envío individual. El envío masivo a los
          colaboradores se habilita cuando finalice el mes, para evitar envíos prematuros o accidentales.
        </p>
      </div>
    </div>
  );
}
