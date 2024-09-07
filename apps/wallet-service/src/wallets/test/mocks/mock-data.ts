export const mockWallet = {
  id: 'wallet1', // Static ID for existing wallet tests
  userId: 'user1',
  cryptoAssets: {
    bitcoin: 2, // Current amount of bitcoin
    ethereum: 5, // Current amount of ethereum
  },
  lastUpdated: new Date(),
};

export const mockRatesResponse = [
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
];
