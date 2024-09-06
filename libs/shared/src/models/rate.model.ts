export interface Rate {
  assetId: string;
  currency: string;
  value: number; //value in the specified currency
  timestamp: Date;
}
