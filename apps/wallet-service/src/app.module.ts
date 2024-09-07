import { Module } from '@nestjs/common';
import { WalletServiceModule } from './wallets/wallet-service.module';
import { SupportedValuesModule } from './supported-values/supported-values.module';

@Module({
  imports: [
    WalletServiceModule,
    SupportedValuesModule,
  ],
})
export class AppModule {}
