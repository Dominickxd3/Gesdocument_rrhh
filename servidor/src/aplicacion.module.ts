import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ModuloSalud } from './modulos/salud/salud.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ModuloSalud],
})
export class ModuloAplicacion {}
