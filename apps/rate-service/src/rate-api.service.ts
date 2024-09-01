import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Rate } from '@shared/models'; 
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RateApiService {
  private readonly apiBaseUrl = 'https://api.coingecko.com/api/v3'; 

  constructor(private readonly httpService: HttpService) {}

  async fetchRates(assetIds: string[], currencies: string[]): Promise<Rate[]> {
    const ids = assetIds.join(',');
    const vsCurrencies = currencies.join(',');

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
      throw new HttpException('Failed to fetch rates from the API', HttpStatus.BAD_GATEWAY);
    }

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

    return rates;
  }
}
