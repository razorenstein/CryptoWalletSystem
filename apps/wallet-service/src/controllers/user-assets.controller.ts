import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Param, Post, Query, Version } from '@nestjs/common';
import { UserAssetsTotalValue } from '../models/user-wallets-total-value.model';
import { validateCurrency } from '@shared/utils';
import { UserAssetsService } from '../services/user-assets.service';
import { RebalanceWalletDto } from '../dtos/rebalance-wallet-dto';

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

  @Post(':walletId/rebalance')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async rebalanceWallet(
    @Headers('X-User-ID') userId: string,
    @Param('walletId') walletId: string,
    @Body() rebalanceWalletDto: RebalanceWalletDto
  ): Promise<void> {

    await this.userAssetsService.rebalance(userId, walletId, rebalanceWalletDto.targetPercentages);
  }
}
