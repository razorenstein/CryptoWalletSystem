import { Controller, Get, Query } from '@nestjs/common';
import { RateService } from '../services/rate-service.service';
import { Rate } from '@shared/models';
import { validateCurrency } from '@shared/utils';
import { RateResponseDto } from '@shared/dtos';

@Controller('rates')
export class RateController {
  constructor(private readonly rateService: RateService) {}

  @Get()
  async getRates(
    @Query('assetIds') assetIds: string,  
    @Query('currency') currency: string   
  ): Promise<RateResponseDto> {
    validateCurrency(currency);
    const assetIdArray = assetIds.split(',');
    const rates: Rate[] = await this.rateService.getRates(assetIdArray, currency);
    
    return { rates };
  }
}