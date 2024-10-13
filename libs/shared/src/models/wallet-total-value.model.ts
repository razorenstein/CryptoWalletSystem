import { Wallet } from '@shared/models';

export interface WalletTotalValue {
  wallet: Wallet;
  totalValue: number;
  currency: string;
}
