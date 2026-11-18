import { Injectable } from '@nestjs/common';

export interface EstadoSalud {
  estado: 'activo';
  fecha: string;
}

@Injectable()
export class ServicioSalud {
  obtenerEstado(): EstadoSalud {
    return { estado: 'activo', fecha: new Date().toISOString() };
  }
}
