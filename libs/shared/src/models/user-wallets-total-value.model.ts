import { WalletTotalValue } from './wallet-total-value.model';

export interface UserAssetsTotalValue {
  wallets: WalletTotalValue[];
  totalValue: number;
  currency: string;
}
