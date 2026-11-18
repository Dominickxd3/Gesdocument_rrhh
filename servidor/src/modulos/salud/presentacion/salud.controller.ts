import { Controller, Get } from '@nestjs/common';
import { EstadoSalud, ServicioSalud } from '../aplicacion/salud.service';

@Controller('salud')
export class ControladorSalud {
  constructor(private readonly servicioSalud: ServicioSalud) {}

  @Get()
  obtenerEstado(): EstadoSalud {
    return this.servicioSalud.obtenerEstado();
  }
}
