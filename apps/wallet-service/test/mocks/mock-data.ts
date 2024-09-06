import { Wallet } from '@shared/models';

export const mockWallet = {
  id: 'wallet1', // Static ID for existing wallet tests
  userId: 'user1',
  cryptoAssets: [
    { id: 'bitcoin', amount: 2 }, // Current amount of bitcoin
    { id: 'ethereum', amount: 5 }, // Current amount of ethereum
  ],
  lastUpdated: new Date(),
};

export const mockRatesResponse = {
  rates: [
    {
      assetId: 'bitcoin',
      currency: 'USD',
      value: 30000,
      timestamp: new Date(),
    },
    {
      assetId: 'ethereum',
      currency: 'USD',
      value: 2000,
      timestamp: new Date(),
    },
  ],
};
