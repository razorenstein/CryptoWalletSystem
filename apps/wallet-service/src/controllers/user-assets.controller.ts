import { Controller, Get, Headers, Query, Version } from '@nestjs/common';
import { validateCurrency } from '@shared/utils';
import { UserAssetsService } from '../services/user-assets.service';
import { UserAssetsTotalValue } from '@shared/models/user-wallets-total-value.model';

@Controller('user-assets')
export class UserAssetsController {
  constructor(private readonly userAssetsService: UserAssetsService) {}

  @Get('total-value')
  @Version('1')
  async getTotalUserAssetsValue(
    @Headers('X-User-ID') userId: string,
    @Query('currency') currency: string
  ): Promise<UserAssetsTotalValue> {
    validateCurrency(currency);
    
    return this.userAssetsService.calculateTotalUserAssetsValue(userId, currency);
  }
}
