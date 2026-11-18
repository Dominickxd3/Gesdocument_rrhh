import { Button } from 'primereact/button';
import { LogoEmpresa } from '@/compartido/componentes/logo-empresa/LogoEmpresa';

interface PropiedadesBarraSuperiorMovil {
  alAbrirMenu: () => void;
}

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
      <LogoEmpresa />
    </header>
  );
}
