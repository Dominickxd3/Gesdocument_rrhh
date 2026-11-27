/// <reference types="vite/client" />

/** Variables locales de cliente/.env.local (datos de personas que no se suben al repositorio). */
interface ImportMetaEnv {
  readonly VITE_REPRESENTANTE_LEGAL?: string;
  readonly VITE_DNI_REPRESENTANTE_LEGAL?: string;
  readonly VITE_GERENTE_ADMINISTRATIVO?: string;
  readonly VITE_DNI_GERENTE_ADMINISTRATIVO?: string;
  /** Pie de página de los documentos de ingreso (dirección, teléfono y correos de la empresa). */
  readonly VITE_PIE_DOCUMENTOS?: string;
  /** Constancias de trabajo: las firma el Gerente General. */
  readonly VITE_GERENTE_GENERAL?: string;
  readonly VITE_DNI_GERENTE_GENERAL?: string;
  readonly VITE_RUC_EMPRESA?: string;
  /** Firma del Gerente General: ruta de una imagen local en public/privado/ (no se sube al repositorio). */
  readonly VITE_FIRMA_GERENTE_GENERAL?: string;
  /** WhatsApp del área de Sistemas para recuperar la contraseña. */
  readonly VITE_WHATSAPP_SISTEMAS?: string;
  /** Cuenta de prueba "dortiz": datos de la persona. */
  readonly VITE_DORTIZ_NOMBRES?: string;
  readonly VITE_DORTIZ_APELLIDOS?: string;
  readonly VITE_DORTIZ_DNI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
