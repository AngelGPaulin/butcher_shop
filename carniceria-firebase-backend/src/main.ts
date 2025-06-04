// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.ALLOWED_ORIGIN,
      credentials: true,
    },
  });

  // *** AGREGAR ESTE CONSOLE.LOG PARA DEPURACIÓN ***
  console.log(`CORS Allowed Origin configurado: ${process.env.ALLOWED_ORIGIN}`);

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Carnicería API')
    .setDescription('API para la gestión de carnicería (Firebase)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(4000);
  console.log(`Backend NestJS escuchando en el puerto 4000`); // Log adicional
}
bootstrap();