import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';


async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,     // Elimina campos que no estén en el DTO
    forbidNonWhitelisted: true, // Lanza error si envían campos extraños
    transform: true,      // Convierte los tipos automáticamente
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
