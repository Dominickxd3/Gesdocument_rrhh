import { Module } from '@nestjs/common';
import { ControladorSalud } from './presentacion/salud.controller';
import { ServicioSalud } from './aplicacion/salud.service';

/** Módulo de ejemplo que muestra la separación por capas de cada funcionalidad. */
@Module({
  controllers: [ControladorSalud],
  providers: [ServicioSalud],
})
export class ModuloSalud {}
