import { Wallet } from '@shared/models';

export class WalletValueResponseDto {
  wallet: Wallet;
  totalValue: number;
  currency: string;
}