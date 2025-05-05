import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuração para Vercel Serverless
  app.enableCors({
    origin: [
      'https://furia-bot-wlvj.vercel.app',
      'http://localhost:3000'
    ], 
    credentials: true // Se usar cookies/tokens

  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();