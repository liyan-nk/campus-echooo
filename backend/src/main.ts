import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable Helmet security headers
  app.use(helmet());

  // 2. Enable CORS with credentials and specific origin configurations
  app.enableCors({
    origin: '*', // In production, specify frontend origin (e.g. process.env.FRONTEND_URL)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. Global Input Sanitization and Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip any non-validated properties
      forbidNonWhitelisted: true, // throw error if non-validated properties exist
      transform: true, // auto-transform payloads to matching DTO structures
    }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Campus Echo backend running on port: ${port}`);
}
bootstrap();
