import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ModuloAplicacion } from './aplicacion.module';

async function iniciar() {
  const aplicacion = await NestFactory.create(ModuloAplicacion);
  aplicacion.setGlobalPrefix('api');
  aplicacion.enableCors({ origin: 'http://localhost:5173' });

  const puerto = aplicacion.get(ConfigService).get<number>('PUERTO', 3000);
  await aplicacion.listen(puerto);
}

void iniciar();
