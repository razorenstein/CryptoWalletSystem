import { Wallet } from '@shared/models';

export const mockWallet = {
  id: 'wallet1',
  userId: 'user1',
  cryptoAssets: [
    { id: 'bitcoin', amount: 2 }, // Current amount of bitcoin
    { id: 'ethereum', amount: 5 }, // Current amount of ethereum
  ],
  lastUpdated: new Date(),
};

export const emptyWallet: Wallet = {
  id: 'wallet2',
  userId: 'user2',
  cryptoAssets: [],
  lastUpdated: new Date(),
};

export const mockWallets = [mockWallet];

export const mockRatesResponse = {
  rates: [
    { assetId: 'bitcoin', currency: 'USD', value: 30000, timestamp: new Date() }, // 2 * 30000 = 60,000
    { assetId: 'ethereum', currency: 'USD', value: 2000, timestamp: new Date() }, // 5 * 2000 = 10,000
  ],
};

export const mockUserWalletIds = ['wallet1'];

