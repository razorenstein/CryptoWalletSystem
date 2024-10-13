import { Module } from '@nestjs/common';
import { WalletSystemLogger } from './wallet-system-logger.service';

@Module({
  providers: [WalletSystemLogger],
  exports: [WalletSystemLogger], // Exporting so other modules can use it
})
export class LoggingModule {}
