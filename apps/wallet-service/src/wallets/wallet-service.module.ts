import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggingModule } from '@shared/logging';
import { FileManagementModule } from '@shared/file-management';
import { HttpModule } from '@nestjs/axios';
import {
  IsAssetIdSupportedConstraint,
  UserIdValidationMiddleware,
} from '@shared/utils/validation';
import { WalletService } from './wallet-service.service';
import { RateService } from './rate-service-api.service';
import { WalletServiceController } from './wallet-service.controller';

@Module({
  controllers: [WalletServiceController],
  imports: [HttpModule, LoggingModule, FileManagementModule],
  providers: [WalletService, RateService, IsAssetIdSupportedConstraint],
})
export class WalletServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserIdValidationMiddleware).forRoutes('*');
  }
}
