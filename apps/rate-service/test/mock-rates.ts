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
