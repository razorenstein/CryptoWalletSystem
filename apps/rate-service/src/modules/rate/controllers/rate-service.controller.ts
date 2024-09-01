import { Controller, Get, Query } from '@nestjs/common';
import { RateService } from '../services/rate-service.service';
import { Rate, RateResponseDto } from '@shared/models';

@Controller('rates')
export class RateController {
  constructor(private readonly rateService: RateService) {}

  @Get()
  async getRates(
    @Query('assetIds') assetIds: string,  
    @Query('currency') currency: string   
  ): Promise<RateResponseDto> {
    const assetIdArray = assetIds.split(',');

    const rates: Rate[] = await this.rateService.getRates(assetIdArray, currency);
    return { rates };
  }
}