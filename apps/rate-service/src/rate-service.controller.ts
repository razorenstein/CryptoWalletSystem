import { Controller, Get, Query } from '@nestjs/common';
import { RateService } from './rate-service.service';
import { Rate } from '@shared/models';

@Controller('rates')
export class RateController {
  constructor(private readonly rateService: RateService) {}

  @Get()
  async getRates(
    @Query('assetIds') assetIds: string,  
    @Query('currency') currency: string   
  ): Promise<Rate[]> {
    const assetIdArray = assetIds.split(',');

    return this.rateService.getRates(assetIdArray, currency);
  }
}