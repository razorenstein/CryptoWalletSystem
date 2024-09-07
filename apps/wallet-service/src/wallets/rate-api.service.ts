import { HttpException, Injectable } from '@nestjs/common';
import { WalletSystemLogger } from '@shared/logging';
import config from '../config/wallet-service.config';
import { Rate } from '@shared/models';
import { HttpService } from '@nestjs/axios';
import { HttpUtil } from '@shared/utils/http-util'; // Import the util

@Injectable()
export class RateApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: WalletSystemLogger,
  ) {}

  async getAssetRates(assetIds: string[], currency: string): Promise<Rate[]> {
    const url = `${config.api.ratesApiBaseUrl}api/v1/rates`;

    try {
      const data = await HttpUtil.get<Rate[]>(this.httpService, url, {
        assetIds: assetIds.join(','),
        currency: currency,
      });

      this.logger.log(
        `Fetched asset rates from rate-service`,
        RateApiService.name,
        { assetIds, currency },
      );

      return data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch asset rates from rate-service`,
        error.stack,
        RateApiService.name,
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
