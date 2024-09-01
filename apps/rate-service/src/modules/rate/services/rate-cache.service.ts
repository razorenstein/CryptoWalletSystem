import { Injectable } from '@nestjs/common';
import * as cache from 'memory-cache';
import { Rate } from '@shared/models'; 
import config from '../../../config/config';

@Injectable()
export class RateCacheService {
    private cacheDuration = config.cache.ttl;
    private maxCacheSize = config.cache.maxItems;

  /**
   * Retrieves a rate from the cache.
   * @param assetId - The ID of the asset (e.g., 'bitcoin')
   * @param currency - The currency code (e.g., 'USD')
   * @returns The cached Rate object or null if not found.
   */
  getRate(assetId: string, currency: string): Rate | null {
    const cacheKey = this.getCacheKey(assetId, currency);
    const cachedRate = cache.get(cacheKey);
    return cachedRate ? (cachedRate as Rate) : null;
  }

  /**
   * Stores a rate in the cache.
   * Ensures no more than x rates are cached at once.
   * @param rate - The Rate object to cache.
   */
  setRate(rate: Rate): void {
    if (cache.size() >= this.maxCacheSize) {
      this.evictOldestItem();
    }
    const cacheKey = this.getCacheKey(rate.assetId, rate.currency);
    cache.put(cacheKey, rate, this.cacheDuration);
  }

    /**
   * Retrieves all cached rates.
   * @returns An array of all cached Rate objects.
   */
    getAllRates(): Rate[] {
        const keys = cache.keys();
        return keys.map((key) => cache.get(key) as Rate);
      }
    
  /**
   * Generates a unique cache key for an asset-currency pair.
   * @param assetId - The ID of the asset.
   * @param currency - The currency code.
   * @returns A string representing the cache key.
   */
  private getCacheKey(assetId: string, currency: string): string {
    return `${assetId.toLowerCase()}-${currency.toLowerCase()}`;
  }

  /**
   * Evicts the oldest item from the cache to maintain cache size limits.
   */
  private evictOldestItem(): void {
    const keys = cache.keys();
    if (keys.length > 0) {
      cache.del(keys[0]);
    }
  }
}