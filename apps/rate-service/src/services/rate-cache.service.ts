import { Injectable } from '@nestjs/common';
import * as cache from 'memory-cache';
import { Rate } from '@shared/models'; 
import config from '../config/config';
import { generateRatesCacheKey } from '../utils/cache-keys.util';

@Injectable()
export class RateCacheService {
    private cacheDuration = config.cache.ttl;
    private maxCacheSize = config.cache.maxItems;

  getRate(assetId: string, currency: string): Rate | null {
    const cacheKey = generateRatesCacheKey(assetId, currency);
    const cachedRate = cache.get(cacheKey);
    return cachedRate ? (cachedRate as Rate) : null;
  }

  setRate(rate: Rate): void {
    if (cache.size() >= this.maxCacheSize) {
      this.evictOldestItem();
    }
    const cacheKey = generateRatesCacheKey(rate.assetId, rate.currency);
    cache.put(cacheKey, rate, this.cacheDuration);
  }

  getAllRates(): Rate[] {
      const keys = cache.keys();
      return keys.map((key) => cache.get(key) as Rate);
    }

  private evictOldestItem(): void {
    const keys = cache.keys();
    if (keys.length > 0) {
      cache.del(keys[0]);
    }
  }
}