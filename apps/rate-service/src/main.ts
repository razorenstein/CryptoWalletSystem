import { NestFactory } from '@nestjs/core';
import { RateModule } from './rate-service.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(RateModule);
  
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI, 
  });  

  await app.listen(3000);
}
bootstrap();
