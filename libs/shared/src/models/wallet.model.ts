import { CryptoAsset } from "./asset.model";

export interface Wallet {
    walletId: string;
    userId: string;
    cryptoAssets: CryptoAsset[];
  }