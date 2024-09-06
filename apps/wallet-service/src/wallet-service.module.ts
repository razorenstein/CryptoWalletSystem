import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { WalletServiceController } from './controllers/wallet-service.controller';
import { LoggingModule } from '@shared/logging';
import { FileManagementModule } from '@shared/file-management';
import { HttpModule } from '@nestjs/axios';
import { UserAssetsController } from './controllers/user-assets.controller';
import { SupportedValuesController } from './controllers/supported-values.controller';
import {
  IsAssetIdSupportedConstraint,
  UserIdValidationMiddleware,
} from '@shared/utils/validation';
import { RateService } from './services/rate-service-api.service';
import { SupportedValuesService } from './services/supported-values.service';
import { UserAssetsService } from './services/user-assets.service';
import { WalletService } from './services/wallet-service.service';

@Module({
  controllers: [
    WalletServiceController,
    UserAssetsController,
    SupportedValuesController,
  ],
  imports: [HttpModule, LoggingModule, FileManagementModule],
  providers: [
    WalletService,
    UserAssetsService,
    RateService,
    SupportedValuesService,
    IsAssetIdSupportedConstraint,
  ],
})
export class WalletServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserIdValidationMiddleware).forRoutes('*');
  }
}
