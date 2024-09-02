import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Rate } from '@shared/models'; 
import { ApiCallFailedException } from '@shared/exceptions'; 
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { WalletSystemLogger } from '@shared/logging';

@Injectable()
export class RateApiService {
  private readonly apiBaseUrl = 'https://api.coingecko.com/api/v3'; 

  constructor(
    private readonly httpService: HttpService,
    private readonly logger: WalletSystemLogger, 
  ) {}

  async fetchRates(assetIds: string[], currencies: string[]): Promise<Rate[]> {
    const ids = assetIds.join(',');
    const vsCurrencies = currencies.join(',');

    this.logger.log(`Fetching rates`, RateApiService.name, { assetIds, currencies });

    let response: AxiosResponse;

    try {
      response = await firstValueFrom(this.httpService.get(`${this.apiBaseUrl}/simple/price`, {
        params: {
          ids: ids,
          vs_currencies: vsCurrencies,
          include_last_updated_at: 'true',
        },
      }));
    } catch (error) {
      const url = `${this.apiBaseUrl}/simple/price?ids=${ids}&vs_currencies=${vsCurrencies}`;
      this.logger.error(`Failed to fetch rates from rates provider`, error.stack, RateApiService.name, { assetIds, currencies, url });
      throw new ApiCallFailedException('RateService', url, error.message);
    }

    this.logger.log(`Successfully fetched rates`, RateApiService.name, { assetIds, currencies });

    return this.parseRates(response.data, assetIds, currencies);
  }

  private parseRates(data: any, assetIds: string[], currencies: string[]): Rate[] {
    const rates: Rate[] = [];

    for (const assetId of assetIds) {
      for (const currency of currencies) {
        const rateValue = data[assetId]?.[currency.toLowerCase()];
        const lastUpdatedAt = data[assetId]?.last_updated_at;

        if (rateValue !== undefined && lastUpdatedAt !== undefined) {
          const timestamp = new Date(lastUpdatedAt * 1000);
          rates.push({
            assetId: assetId,
            currency: currency,
            value: rateValue,
            timestamp: timestamp,
          } as Rate);
        }
      }
    }

    this.logger.log(`Parsed rates successfully`, RateApiService.name, { assetIds, currencies, ratesCount: rates.length });

    return rates;
  }
}