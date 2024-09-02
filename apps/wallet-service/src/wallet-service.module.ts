import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { WalletServiceController } from './controllers/wallet-service.controller';
import { WalletAssetServiceController } from './controllers/wallet-asset-service.controller';
import { WalletService } from './wallet-service.service';
import { WalletAssetService } from './wallet-asset-service.service';
import { RateService } from './rate-service-api.service';
import { LoggingModule } from '@shared/logging';
import { FileManagementModule } from '@shared/file-management';
import { UserIdValidationMiddleware } from './middlewares/user-id-validation.middleware';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [WalletServiceController, WalletAssetServiceController],
  imports: [HttpModule, LoggingModule, FileManagementModule],
  providers: [WalletService, WalletAssetService, RateService]
})
export class WalletServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdValidationMiddleware)
      .forRoutes('*');  
  }
}
