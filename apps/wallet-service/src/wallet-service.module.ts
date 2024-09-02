import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { WalletServiceController } from './controllers/wallet-service.controller';
import { WalletService } from './wallet-service.service';
import { LoggingModule } from '@shared/logging';
import { FileManagementModule } from '@shared/file-management';
import { UserIdValidationMiddleware } from './middlewares/user-id-validation.middleware';

@Module({
  controllers: [WalletServiceController],
  imports: [LoggingModule, FileManagementModule],
  providers: [WalletService]
})
export class WalletServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdValidationMiddleware)
      .forRoutes('*');  
  }
}
