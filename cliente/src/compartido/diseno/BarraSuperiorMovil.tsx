import { Button } from 'primereact/button';

interface PropiedadesBarraSuperiorMovil {
  alAbrirMenu: () => void;
}

/** Barra superior del celular: solo el botón del menú (el logo y el nombre están dentro del menú). */
export function BarraSuperiorMovil({ alAbrirMenu }: PropiedadesBarraSuperiorMovil) {
  return (
    <header className="barra-superior-movil">
      <Button
        icon="pi pi-bars"
        text
        rounded
        aria-label="Abrir menú"
        className="boton-menu"
        onClick={alAbrirMenu}
      />
    </header>
  );
}
