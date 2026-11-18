import type { RepositorioBoletas } from '../dominio/boleta';
import { RepositorioBoletasPrueba } from '../infraestructura/RepositorioBoletasPrueba';

/**
 * Punto de composición del módulo: aquí se elige la implementación del repositorio.
 * Mockup: datos en memoria. Despliegue: implementación HTTP contra Nest.js.
 */
export const repositorioBoletas: RepositorioBoletas = new RepositorioBoletasPrueba();
