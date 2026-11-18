import { netoAPagar, nombrePeriodo, type Boleta, type Periodo } from '../dominio/boleta';
import { formatearFecha } from './formato';

/** Descarga las boletas como CSV (separado por ";", se abre directamente en Excel). */
export function exportarBoletasCsv(boletas: Boleta[], periodo: Periodo): void {
  const encabezados = ['DNI', 'Trabajador', 'Área', 'Cargo', 'Neto a pagar', 'Firma', 'Fecha de firma', 'Envío', 'Fecha de envío'];
  const filas = boletas.map((b) => [
    b.dni,
    b.trabajador,
    b.area,
    b.cargo,
    netoAPagar(b).toFixed(2),
    b.firma === 'firmada' ? 'Firmada' : 'Pendiente',
    b.fechaFirma ? formatearFecha(b.fechaFirma) : '',
    b.estadoEnvio === 'enviado' ? 'Enviado' : 'No enviado',
    b.fechaEnvio ? formatearFecha(b.fechaEnvio) : '',
  ]);
  const escapar = (valor: string) => `"${valor.replace(/"/g, '""')}"`;
  const contenido = [encabezados, ...filas].map((fila) => fila.map(escapar).join(';')).join('\r\n');

  const archivo = new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(archivo);
  enlace.download = `boletas-${nombrePeriodo(periodo).toLowerCase().replace(' ', '-')}.csv`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}
