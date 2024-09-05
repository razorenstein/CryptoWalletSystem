import { NestFactory } from '@nestjs/core';
import { WalletServiceModule } from './wallet-service.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(WalletServiceModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI, 
  });  

  app.useGlobalPipes(new ValidationPipe()); 
  await app.listen(3001);
}
bootstrap();
