import { Module } from '@nestjs/common';
import { WalletSystemLogger } from '../logging';
import { FileManagementService } from './file-managment-service';

@Module({
  providers: [WalletSystemLogger, FileManagementService],
  exports: [FileManagementService],
})
export class FileManagementModule {}
