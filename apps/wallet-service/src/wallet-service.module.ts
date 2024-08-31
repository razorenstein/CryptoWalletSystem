import { Module } from '@nestjs/common';
import { WalletServiceController } from './controllers/wallet-service.controller';
import { WalletService } from './services/wallet-service.service';
import { UserIdInterceptor } from './interceptors/user-id.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { FileManagementModule } from '@shared/file-management/FileManagementModule';

@Module({
  imports: [FileManagementModule],
  controllers: [WalletServiceController],
  providers: [WalletService,
    {
    provide: APP_INTERCEPTOR,
    useClass: UserIdInterceptor,
  },]
})
export class WalletServiceModule {}
