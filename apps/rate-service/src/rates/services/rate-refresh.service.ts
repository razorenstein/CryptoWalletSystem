import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RateCacheService } from './rate-cache.service';
import { RateApiService } from './rate-api.service';
import { Rate } from '@shared/models';
import config from '../../config/rate-service.config';

@Injectable()
export class RateRefreshService {
  constructor(
    private readonly rateCacheService: RateCacheService,
    private readonly rateApiService: RateApiService,
  ) {}

  @Cron(config.cron.rateRefreshInterval)
  async refreshRates() {
    const cachedRates = this.rateCacheService.getAllRates();

    const assetIds: Set<string> = new Set();
    const currencies: Set<string> = new Set();

    for (const rate of cachedRates) {
      assetIds.add(rate.assetId);
      currencies.add(rate.currency);
    }

    if (assetIds.size === 0 || currencies.size === 0) {
      return;
    }

    const assetIdsArray = Array.from(assetIds);
    const currenciesArray = Array.from(currencies);

    const fetchedRates: Rate[] = await this.rateApiService.fetchRates(
      assetIdsArray,
      currenciesArray,
    );

    // Filter fetched rates to include only those that match the cached pairs
    const filteredRates = fetchedRates.filter((fetchedRate) =>
      cachedRates.some(
        (cachedRate) =>
          cachedRate.assetId === fetchedRate.assetId &&
          cachedRate.currency === fetchedRate.currency,
      ),
    );

    filteredRates.forEach((rate) => {
      this.rateCacheService.setRate(rate);
    });
  }
}
