import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Prefijo común para toda la API.
  app.setGlobalPrefix('api');

  // Validación automática de todos los DTOs entrantes.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // y rechaza la petición si las trae
      transform: true, // convierte payloads a las clases/tipos del DTO
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS para el frontend Next.js.
  app.enableCors({
    origin: config.get<AppConfig['corsOrigin']>('corsOrigin'),
  });

  const port = config.get<AppConfig['port']>('port') ?? 3001;
  await app.listen(port);
}
void bootstrap();
