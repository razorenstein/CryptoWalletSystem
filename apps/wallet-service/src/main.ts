import { NestFactory } from '@nestjs/core';
import { WalletServiceModule } from './wallet-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(WalletServiceModule);
  app.useGlobalPipes(new ValidationPipe()); 
  await app.listen(3001);
}
bootstrap();
