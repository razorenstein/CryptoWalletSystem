import { Injectable,  } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { WalletSystemLogger } from '@shared/logging';
import { ApiCallFailedException } from '@shared/exceptions';
import { RateResponseDto } from '@shared/dto';

@Injectable()
export class RateService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: WalletSystemLogger,
  ) {}

  async getAssetRates(assetIds: string[], currency: string): Promise<RateResponseDto> {
    const url = `http://localhost:3000/rates?assetIds=${assetIds.join(',')}&currency=${currency}`;
    
    try {
      const response = await lastValueFrom(this.httpService.get<RateResponseDto>(url));
      this.logger.log(`Fetched asset rates from rate-service`, RateService.name, { assetIds, currency });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch asset rates from rate-service`, error.stack, RateService.name, { assetIds, currency });
      throw new ApiCallFailedException('RateService', url, error.message);
    }
  }
}
