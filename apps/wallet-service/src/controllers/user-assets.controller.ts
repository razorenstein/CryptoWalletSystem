import { Controller, Get, Headers, Query } from '@nestjs/common';
import { UserAssetsService } from '../user-assets.service';
import { UserAssetsTotalValue } from '../models/user-wallets-total-value.model';

@Controller('user-assets')
export class UserAssetsController {
  constructor(private readonly userAssetsService: UserAssetsService) {}

  @Get('total-value')
  async getTotalUserAssetsValue(
    @Headers('X-User-ID') userId: string,
    @Query('currency') currency: string
  ): Promise<UserAssetsTotalValue> {
    return this.userAssetsService.calculateTotalUserAssetsValue(userId, currency);
  }
}
