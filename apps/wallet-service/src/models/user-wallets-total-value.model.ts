import { WalletTotalValue } from './wallet-total-value.model';

export class UserAssetsTotalValue {
  wallets: WalletTotalValue[];
  totalValue: number;
  currency: string;
}
