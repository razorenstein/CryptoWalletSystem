import { Rate } from '@shared/models';

export const mockRates: Rate[] = [
  {
    assetId: 'bitcoin',
    currency: 'USD',
    value: 60000,
    timestamp: new Date(1629300000 * 1000), 
  },
  {
    assetId: 'ethereum',
    currency: 'USD',
    value: 4000,
    timestamp: new Date(1629300000 * 1000), 
  },
];

export const mockCachedRates: Rate[] = [
  { assetId: 'bitcoin', currency: 'USD', value: 30000, timestamp: new Date() },
  { assetId: 'ethereum', currency: 'USD', value: 2000, timestamp: new Date() },
];

export const mockFetchedRates: Rate[] = [
  { assetId: 'bitcoin', currency: 'USD', value: 31000, timestamp: new Date() },
  { assetId: 'ethereum', currency: 'USD', value: 2100, timestamp: new Date() },
];
