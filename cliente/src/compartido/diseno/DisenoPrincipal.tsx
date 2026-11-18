import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from 'primereact/sidebar';
import { BarraLateral } from './barra-lateral/BarraLateral';
import { BarraSuperiorMovil } from './BarraSuperiorMovil';
import { useConsultaMedios } from '@/compartido/ganchos/useConsultaMedios';
import { usePreferenciaGuardada } from '@/compartido/ganchos/usePreferenciaGuardada';
import './diseno.css';

/**
 * Estructura general de la aplicación.
 * - Escritorio y tableta (≥ 768 px): barra lateral fija que se contrae o expande al
 *   presionar el logo. La elección se guarda en el navegador; si no hay ninguna,
 *   empieza expandida en escritorio y contraída en tableta (768–1023 px).
 * - Móvil (< 768 px): barra superior con botón que abre la barra lateral como panel.
 */
export function DisenoPrincipal() {
  const esMovil = useConsultaMedios('(max-width: 767px)');
  const esTableta = useConsultaMedios('(min-width: 768px) and (max-width: 1023px)');
  const [contraidaGuardada, guardarContraida] = usePreferenciaGuardada<boolean>('barra-lateral-contraida');
  const esCompacta = contraidaGuardada ?? esTableta;
  const [panelAbierto, setPanelAbierto] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setPanelAbierto(false), [pathname, esMovil]);

  return (
    <div className="diseno-principal">
      {esMovil ? (
        <>
          <BarraSuperiorMovil alAbrirMenu={() => setPanelAbierto(true)} />
          <Sidebar
            visible={panelAbierto}
            onHide={() => setPanelAbierto(false)}
            showCloseIcon={false}
            className="panel-barra-lateral"
            ariaCloseLabel="Cerrar menú"
          >
            <BarraLateral />
          </Sidebar>
        </>
      ) : (
        <aside className={`contenedor-barra-lateral${esCompacta ? ' es-compacta' : ''}`}>
          <BarraLateral
            compacta={esCompacta}
            alAlternarCompacta={() => guardarContraida(!esCompacta)}
          />
        </aside>
      )}

      <main className="contenido-principal">
        <Outlet />
      </main>
    </div>
  );
}
