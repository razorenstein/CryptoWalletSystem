import { Test, TestingModule } from '@nestjs/testing';
import { RateCacheService } from '../src/services/rate-cache.service';
import * as cache from 'memory-cache';
import config from '../src/config/config';
import { mockRates } from './mock-rates';
import { generateRatesCacheKey } from '../src/utils/cache-keys.util';

jest.mock('memory-cache', () => ({
    put: jest.fn(),
    get: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
    size: jest.fn(),
  }));
  
  describe('RateCacheService', () => {
    let service: RateCacheService;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [RateCacheService],
      }).compile();
  
      service = module.get<RateCacheService>(RateCacheService);
  
      // Setting up mock values for configuration
      config.cache.ttl = 60000; // 60 seconds
      config.cache.maxItems = 3; // Max 3 items in cache
    });
  
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  
    describe('getRate', () => {
      it('should return null if the rate is not in cache', () => {
        (cache.get as jest.Mock).mockReturnValue(null);
  
        const rate = service.getRate('bitcoin', 'USD');
        expect(rate).toBeNull();
        expect(cache.get).toHaveBeenCalledWith(generateRatesCacheKey('bitcoin', 'USD'));
      });
  
      it('should return the rate if it is in cache', () => {
        (cache.get as jest.Mock).mockReturnValue(mockRates[0]);
  
        const rate = service.getRate('bitcoin', 'USD');
        expect(rate).toEqual(mockRates[0]);
        expect(cache.get).toHaveBeenCalledWith(generateRatesCacheKey('bitcoin', 'USD'));
      });
    });
  
    describe('setRate', () => {
      it('should set a rate in the cache', () => {
        const mockRate = mockRates[0];
  
        (cache.size as jest.Mock).mockReturnValue(0);
        
        service.setRate(mockRate);
  
        expect(cache.put).toHaveBeenCalledWith(
            generateRatesCacheKey('bitcoin', 'USD'),
          mockRate,
          config.cache.ttl
        );
      });
  
      it('should evict the oldest item when max cache size is reached', () => {
        const mockRate = mockRates[0];
  
        (cache.size as jest.Mock).mockReturnValue(3);
        (cache.keys as jest.Mock).mockReturnValue(['key1', 'key2', 'key3']);
        
        service.setRate(mockRate);
  
        expect(cache.del).toHaveBeenCalledWith('key1');
        expect(cache.put).toHaveBeenCalledWith(
            generateRatesCacheKey('bitcoin', 'USD'),
          mockRate,
          config.cache.ttl
        );
      });
    });
  
    describe('getAllRates', () => {
      it('should return all rates in the cache', () => {
        (cache.keys as jest.Mock).mockReturnValue(['bitcoin-usd', 'ethereum-usd']);
        (cache.get as jest.Mock).mockImplementation((key: string) => {
          return mockRates.find(rate => rate.assetId === key.split('-')[0]);
        });
  
        const rates = service.getAllRates();
  
        expect(rates).toEqual(mockRates);
        expect(cache.keys).toHaveBeenCalled();
        expect(cache.get).toHaveBeenCalledWith(generateRatesCacheKey('bitcoin', 'USD'));
        expect(cache.get).toHaveBeenCalledWith(generateRatesCacheKey('ethereum', 'USD'));
      });
    });
  });