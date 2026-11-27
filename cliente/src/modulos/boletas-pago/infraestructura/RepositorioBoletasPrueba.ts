import { ahoraLocal } from '@/compartido/formato/fechas';
import {
  clavePeriodo,
  type Boleta,
  type BoletaDePeriodo,
  type ConfiguracionBoletas,
  type Periodo,
  type RepositorioBoletas,
} from '../dominio/boleta';
import { EMPRESA_INICIAL, generarBoletas } from './datosPrueba';

/** En el mockup la configuración se guarda en este navegador; en producción irá a SQL Server. */
const CLAVE_CONFIGURACION = 'gesdocument-rrhh:configuracion-boletas';

/** Firma del Gerente General por defecto (imagen local en public/privado/, fuera del repositorio). */
const FIRMA_POR_DEFECTO = import.meta.env.VITE_FIRMA_GERENTE_GENERAL || null;

const DEMORA_MS = 350;
const esperar = () => new Promise((resolver) => setTimeout(resolver, DEMORA_MS));

/**
 * Repositorio en memoria para el mockup. Conserva los cambios (envíos, firmas revertidas)
 * mientras la página siga abierta. Para el despliegue se reemplaza por uno que consuma la API de Nest.js.
 */
export class RepositorioBoletasPrueba implements RepositorioBoletas {
  private readonly boletasPorPeriodo = new Map<string, Boleta[]>();

  constructor(private readonly hoy = new Date()) {}

  async obtenerConfiguracion(): Promise<ConfiguracionBoletas> {
    const inicial: ConfiguracionBoletas = { empresa: { ...EMPRESA_INICIAL }, firmaEmpleador: FIRMA_POR_DEFECTO };
    try {
      const guardada = localStorage.getItem(CLAVE_CONFIGURACION);
      if (!guardada) return inicial;
      const datos = JSON.parse(guardada) as Partial<ConfiguracionBoletas>;
      return {
        empresa: { ...inicial.empresa, ...datos.empresa },
        // Si RR. HH. quitó la firma en Configuración, se respeta; si nunca la tocó, va la de por defecto.
        firmaEmpleador: 'firmaEmpleador' in datos ? (datos.firmaEmpleador ?? null) : FIRMA_POR_DEFECTO,
      };
    } catch {
      return inicial;
    }
  }

  async guardarConfiguracion(configuracion: ConfiguracionBoletas): Promise<void> {
    await esperar();
    try {
      localStorage.setItem(CLAVE_CONFIGURACION, JSON.stringify(configuracion));
    } catch {
      throw new Error('No se pudo guardar la configuración en este navegador. Prueba con una imagen de firma más liviana.');
    }
  }

  async listarPeriodos(): Promise<Periodo[]> {
    await esperar();
    const periodos: Periodo[] = [];
    const anioActual = this.hoy.getFullYear();
    const mesActual = this.hoy.getMonth() + 1;
    for (let anio = anioActual; anio >= anioActual - 1; anio--) {
      const ultimoMes = anio === anioActual ? mesActual : 12;
      for (let mes = ultimoMes; mes >= 1; mes--) {
        const enCurso = anio === anioActual && mes === mesActual;
        periodos.push({ anio, mes, estado: enCurso ? 'en_curso' : 'cerrado' });
      }
    }
    return periodos;
  }

  async listarBoletas(periodo: Periodo): Promise<Boleta[]> {
    await esperar();
    return structuredClone(this.obtener(periodo));
  }

  async enviar(periodo: Periodo, ids: string[]): Promise<string> {
    await esperar();
    const fecha = ahoraLocal();
    const pendientes = new Set(ids);
    for (const boleta of this.obtener(periodo)) {
      if (pendientes.has(boleta.id)) {
        boleta.estadoEnvio = 'enviado';
        boleta.fechaEnvio = fecha;
      }
    }
    return fecha;
  }

  async revertirFirma(periodo: Periodo, id: string): Promise<void> {
    await esperar();
    const boleta = this.obtener(periodo).find((b) => b.id === id);
    if (boleta) {
      boleta.firma = 'pendiente';
      boleta.fechaFirma = null;
      boleta.firmaColaborador = null;
    }
  }

  async listarBoletasDe(dni: string): Promise<BoletaDePeriodo[]> {
    const periodos = await this.listarPeriodos();
    return periodos.flatMap((periodo) =>
      this.obtener(periodo)
        .filter((b) => b.dni === dni && b.estadoEnvio === 'enviado')
        .map((b) => ({ periodo, boleta: structuredClone(b) })),
    );
  }

  async firmar(periodo: Periodo, id: string, firmaImagen: string): Promise<string> {
    await esperar();
    const fecha = ahoraLocal();
    const boleta = this.obtener(periodo).find((b) => b.id === id);
    if (boleta) {
      boleta.firma = 'firmada';
      boleta.fechaFirma = fecha;
      boleta.firmaColaborador = firmaImagen;
    }
    return fecha;
  }

  private obtener(periodo: Periodo): Boleta[] {
    const clave = clavePeriodo(periodo);
    if (!this.boletasPorPeriodo.has(clave)) {
      this.boletasPorPeriodo.set(clave, generarBoletas(periodo));
    }
    return this.boletasPorPeriodo.get(clave)!;
  }
}
