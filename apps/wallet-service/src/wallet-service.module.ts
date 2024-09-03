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
import { UserAssetsController } from './controllers/user-assets.controller';
import { UserAssetsService } from './user-assets.service';
import { SupportedValuesService } from './supported-values.service';
import { SupportedValuesController } from './controllers/supported-values.controller';
import { IsAssetIdSupportedConstraint } from '@shared/utils/validation/asset-id-validator.decorator';

@Module({
  controllers: [WalletServiceController, WalletAssetServiceController, UserAssetsController, SupportedValuesController],
  imports: [HttpModule, LoggingModule, FileManagementModule],
  providers: [WalletService, WalletAssetService, UserAssetsService, RateService, SupportedValuesService, IsAssetIdSupportedConstraint]
})
export class WalletServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdValidationMiddleware)
      .forRoutes('*');  
  }
}
