import {
  Controller,
  Get,
  Post,
  Query,
  Delete,
  Param,
  Headers,
  Body,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { Wallet } from '@shared/models';
import { validateCurrency } from '@shared/utils';
import { WalletService } from './wallet-service.service';
import { AddAssetDto } from './dtos/add-asset-request.dto';
import { RemoveAssetDto } from './dtos/remove-asset-request.dto';
import { RebalanceWalletDto } from './dtos/rebalance-wallet-dto';
import { WalletTotalValue } from '@shared/models/wallet-total-value.model';
import { UserAssetsTotalValue } from '@shared/models/user-wallets-total-value.model';

@Controller('wallets')
export class WalletServiceController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  async createWallet(@Headers('X-User-ID') userId: string): Promise<Wallet> {
    return this.walletService.createWallet(userId);
  }

  @Get(':id')
  @Version('1')
  async getWallet(
    @Headers('X-User-ID') userId: string,
    @Param('id') walletId: string,
  ): Promise<Wallet> {
    return this.walletService.getWallet(userId, walletId);
  }

  @Delete(':id')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWallet(
    @Headers('X-User-ID') userId: string,
    @Param('id') walletId: string,
  ): Promise<void> {
    return this.walletService.deleteWallet(userId, walletId);
  }

  @Get('value/:walletId')
  @Version('1')
  async getTotalWalletValue(
    @Headers('X-User-ID') userId: string,
    @Param('walletId') walletId: string,
    @Query('currency') currency: string,
  ): Promise<WalletTotalValue> {
    validateCurrency(currency);
    return await this.walletService.calculateTotalValue(
      userId,
      walletId,
      currency,
    );
  }

  @Get('user-assets/value')
  @Version('1')
  async getTotalUserAssetsValue(
    @Headers('X-User-ID') userId: string,
    @Query('currency') currency: string,
  ): Promise<UserAssetsTotalValue> {
    validateCurrency(currency);

    return this.walletService.calculateTotalUserAssetsValue(userId, currency);
  }

  @Post('assets/:walletId')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async addAsset(
    @Headers('X-User-ID') userId: string,
    @Param('walletId') walletId: string,
    @Body() addAssetDto: AddAssetDto,
  ): Promise<Wallet> {
    return this.walletService.addAsset(userId, walletId, addAssetDto);
  }

  @Delete('assets/:walletId')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async removeAsset(
    @Headers('X-User-ID') userId: string,
    @Param('walletId') walletId: string,
    @Body() removeAssetDto: RemoveAssetDto,
  ): Promise<Wallet> {
    return this.walletService.removeAsset(userId, walletId, removeAssetDto);
  }

  @Post('rebalance/:walletId')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async rebalanceWallet(
    @Headers('X-User-ID') userId: string,
    @Param('walletId') walletId: string,
    @Body() rebalanceWalletDto: RebalanceWalletDto,
  ): Promise<void> {
    await this.walletService.rebalance(
      userId,
      walletId,
      rebalanceWalletDto.targetPercentages,
    );
  }
}
