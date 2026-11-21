/// <reference types="vite/client" />

/** Variables locales de cliente/.env.local (datos de personas que no se suben al repositorio). */
interface ImportMetaEnv {
  readonly VITE_REPRESENTANTE_LEGAL?: string;
  readonly VITE_DNI_REPRESENTANTE_LEGAL?: string;
  readonly VITE_GERENTE_ADMINISTRATIVO?: string;
  readonly VITE_DNI_GERENTE_ADMINISTRATIVO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
