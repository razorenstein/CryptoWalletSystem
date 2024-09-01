import { NestFactory } from '@nestjs/core';
import { RateModule } from './modules/rate/rate-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RateModule);
  await app.listen(3000);
}
bootstrap();