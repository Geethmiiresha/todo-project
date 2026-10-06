import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  // Dev walata: localhost eke ona port ekakin enna denawa
  app.enableCors({ origin: /^http:\/\/(localhost|127\.0\.0\.1):\d+$/ });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(3000);
}
bootstrap();