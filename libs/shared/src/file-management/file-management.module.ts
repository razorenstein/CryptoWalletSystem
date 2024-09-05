import { Module } from '@nestjs/common';
import { UserWalletsFileManagementService } from './user-wallets-file-management.service';
import { WalletFileManagementService } from './wallet-file-management.service';
import { WalletSystemLogger } from '../logging';

@Module({
  providers: [
    WalletSystemLogger, 
    UserWalletsFileManagementService, 
    WalletFileManagementService,
  ],
  exports: [
    UserWalletsFileManagementService, 
    WalletFileManagementService,
  ],
})
export class FileManagementModule {}