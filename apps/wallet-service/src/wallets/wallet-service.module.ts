import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggingModule } from '@shared/logging';
import { FileManagementModule } from '@shared/file-management';
import { HttpModule } from '@nestjs/axios';
import {
  IsAssetIdSupportedConstraint,
  UserIdValidationMiddleware,
} from '@shared/utils/validation';
import { WalletService } from './wallet.service';
import { RateApiService } from './rate-api.service';
import { WalletServiceController } from './wallet-service.controller';

@Module({
  controllers: [WalletServiceController],
  imports: [HttpModule, LoggingModule, FileManagementModule],
  providers: [WalletService, RateApiService, IsAssetIdSupportedConstraint],
})
export class WalletServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserIdValidationMiddleware).forRoutes('*');
  }
}
