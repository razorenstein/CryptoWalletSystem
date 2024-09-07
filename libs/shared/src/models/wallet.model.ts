export interface Wallet {
  id: string;
  userId: string;
  cryptoAssets: { [assetId: string]: number };
  lastUpdated: Date;
}
