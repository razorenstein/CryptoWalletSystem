import { CryptoAsset } from "./asset.model";

export interface Wallet {
    id: string;
    userId: string;
    cryptoAssets: CryptoAsset[];
    lastUpdated: Date;
  }