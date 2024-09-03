import { Controller, Get, Headers, Query } from '@nestjs/common';
import { UserAssetsTotalValue } from '../models/user-wallets-total-value.model';
import { validateCurrency } from '@shared/utils';
import { UserAssetsService } from '../services/user-assets.service';

@Controller('user-assets')
export class UserAssetsController {
  constructor(private readonly userAssetsService: UserAssetsService) {}

  @Get('total-value')
  async getTotalUserAssetsValue(
    @Headers('X-User-ID') userId: string,
    @Query('currency') currency: string
  ): Promise<UserAssetsTotalValue> {
    validateCurrency(currency);
    
    return this.userAssetsService.calculateTotalUserAssetsValue(userId, currency);
  }
}
