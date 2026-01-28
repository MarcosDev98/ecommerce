import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('Documentación detallada de nuestra tienda online')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // La URL será /api


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
