interface PropiedadesEncabezadoPagina {
  titulo: string;
  descripcion?: string;
}

export function EncabezadoPagina({ titulo, descripcion }: PropiedadesEncabezadoPagina) {
  return (
    <header className="encabezado-pagina">
      <h1>{titulo}</h1>
      {descripcion && <p>{descripcion}</p>}
    </header>
  );
}
