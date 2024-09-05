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