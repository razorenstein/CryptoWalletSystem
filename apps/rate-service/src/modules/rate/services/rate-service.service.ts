import { Injectable } from '@nestjs/common';
import { RateCacheService } from './rate-cache.service';
import { RateApiService } from './rate-api.service';
import { Rate } from '@shared/models'; 

@Injectable()
export class RateService {
  constructor(
    private readonly rateCacheService: RateCacheService,
    private readonly rateApiService: RateApiService,
  ) {}

  /**
   * Retrieves exchange rates for the specified asset IDs and a single currency.
   *
   * Checks the cache first. If a rate is missing, fetches it from the API and caches it.
   *
   * @param {string[]} assetIds - Asset IDs to fetch rates for.
   * @param {string} currency - Currency code to fetch rates in.
   * @returns {Promise<Rate[]>} - A promise resolving to an array of `Rate` objects.
   */
  async getRates(assetIds: string[], currency: string): Promise<Rate[]> {
    const missingRates: string[] = [];
    const rates: Rate[] = [];

    // Check the cache for each asset-currency pair
    for (const assetId of assetIds) {
      const cachedRate = this.rateCacheService.getRate(assetId, currency);

      if (cachedRate) {
        rates.push(cachedRate);
      } else {
        missingRates.push(assetId);
      }
    }

    // If there are missing rates, fetch them from the API
    if (missingRates.length > 0) {
      const fetchedRates = await this.rateApiService.fetchRates(missingRates, [currency]);

      // Cache the fetched rates and add them to the result list
      for (const rate of fetchedRates) {
        this.rateCacheService.setRate(rate);
        rates.push(rate);
      }
    }

    return rates;
  }
}