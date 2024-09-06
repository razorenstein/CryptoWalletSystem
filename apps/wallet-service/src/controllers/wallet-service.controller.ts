import { Controller, Get, Post, Query, Delete, Param, Headers, Body, HttpCode, HttpStatus, Version } from '@nestjs/common';
import { Wallet } from '@shared/models';
import { WalletTotalValue } from '../models/wallet-total-value.model';
import { validateCurrency } from '@shared/utils';
import { WalletService } from '../services/wallet-service.service';

@Controller('wallets')
export class WalletServiceController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  async createWallet(
    @Headers('X-User-ID') userId: string, 
  ): Promise<Wallet> {
    return this.walletService.createWallet(userId);
  }
  
  @Get(':id')
  @Version('1')
  async getWallet(
    @Headers('X-User-ID') userId: string, 
    @Param('id') walletId: string
  ): Promise<Wallet> {
    return this.walletService.getWallet(userId, walletId);
  }

  @Delete(':id')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWallet(
    @Headers('X-User-ID') userId: string, 
    @Param('id') walletId: string
  ): Promise<void> {
    return this.walletService.deleteWallet(userId, walletId);
  }

  @Get(':walletId/value')
  @Version('1')
  async getTotalWalletValue(
    @Headers('X-User-ID') userId: string,
    @Param('walletId') walletId: string,
    @Query('currency') currency: string
  ): Promise<WalletTotalValue> {
    validateCurrency(currency);
    
    return await this.walletService.calculateTotalValue(userId, walletId, currency);
  }
}