import { HttpException, Injectable } from '@nestjs/common';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { WalletSystemLogger } from '@shared/logging';
import config from '../config/config';
import { Rate } from '@shared/models';

@Injectable()
export class RateService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: WalletSystemLogger,
  ) {}

  async getAssetRates(
    assetIds: string[],
    currency: string,
  ): Promise<Rate[]> {
    const url = `${config.api.ratesApiBaseUrl}api/v1/rates?assetIds=${assetIds.join(',')}&currency=${currency}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<Rate[]>(url),
      );
      this.logger.log(
        `Fetched asset rates from rate-service`,
        RateService.name,
        { assetIds, currency },
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch asset rates from rate-service`,
        error.stack,
        RateService.name,
        { assetIds, currency },
      );
      throw new HttpException(
        {
          message: 'RateService Error',
          details: { assetIds, currency, url, originalError: error.message },
        },
        500,
      );
    }
  }
}
