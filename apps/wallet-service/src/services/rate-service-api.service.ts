import { HttpException, Injectable,  } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { WalletSystemLogger } from '@shared/logging';
import { RateResponseDto } from '@shared/dtos';
import config from '../config/config';

@Injectable()
export class RateService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: WalletSystemLogger,
  ) {}

  async getAssetRates(assetIds: string[], currency: string): Promise<RateResponseDto> {
    const url = `${config.api.ratesApiBaseUrl}api/v1/rates?assetIds=${assetIds.join(',')}&currency=${currency}`;
    
    try {
      const response = await lastValueFrom(this.httpService.get<RateResponseDto>(url));
      this.logger.log(`Fetched asset rates from rate-service`, RateService.name, { assetIds, currency });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch asset rates from rate-service`, error.stack, RateService.name, { assetIds, currency });
      throw new HttpException({
        message: 'RateService Error',
        details: { assetIds, currency, url, originalError: error.message },
      }, 500);
    }
  }
}
