import { Controller, Get, Query, Version } from '@nestjs/common';
import { RateService } from '../services/rate-service.service';
import { Rate } from '@shared/models';
import { validateCurrency } from '@shared/utils';

@Controller('rates')
export class RateController {
  constructor(private readonly rateService: RateService) {}

  @Get()
  @Version('1')
  async getRates(
    @Query('assetIds') assetIds: string,
    @Query('currency') currency: string,
  ): Promise<Rate[]> {
    validateCurrency(currency);
    const assetIdArray = assetIds.split(',');
    const rates: Rate[] = await this.rateService.getRates(
      assetIdArray,
      currency,
    );

    return rates;
  }
}
