import { NestFactory } from '@nestjs/core';
import { WalletServiceModule } from './wallet-service.module';
import { UserIdInterceptor } from './interceptors/user-id.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(WalletServiceModule);
  app.useGlobalInterceptors(new UserIdInterceptor());
  await app.listen(3000);
}
bootstrap();
