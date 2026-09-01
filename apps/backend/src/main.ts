import 'dotenv/config';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth/better-auth';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // Mount Better Auth BEFORE body parsing middleware
  app.use('/api/auth', toNodeHandler(auth));

  // Re-enable body parsing for non-auth routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['set-auth-token'],
  });

  const config = new DocumentBuilder()
    .setTitle('CMS EISD API')
    .setDescription('Headless CMS API for managing Events and Medium Articles')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'CMS EISD API Docs',
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
