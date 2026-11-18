import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrimeReactProvider } from 'primereact/api';
import { Aplicacion } from '@/aplicacion/Aplicacion';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import '@/compartido/estilos/base.css';

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <PrimeReactProvider value={{ ripple: false }}>
      <Aplicacion />
    </PrimeReactProvider>
  </StrictMode>,
);
