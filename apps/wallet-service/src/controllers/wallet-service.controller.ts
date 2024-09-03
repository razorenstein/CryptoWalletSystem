import { Controller, Get, Post, Query, Delete, Param, Headers, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateWalletDto } from '../dtos/requests/create-wallet-request.dto';
import { Wallet } from '@shared/models';
import { WalletTotalValue } from '../models/wallet-total-value.model';
import { validateCurrency } from '@shared/utils';
import { WalletService } from '../services/wallet-service.service';

@Controller('wallets')
export class WalletServiceController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWallet(
    @Headers('X-User-ID') userId: string, 
    @Body() createWalletDto: CreateWalletDto
  ): Promise<Wallet> {
    return this.walletService.createWallet(userId, createWalletDto.walletId);
  }
  
  @Get(':id')
  async getWallet(
    @Headers('X-User-ID') userId: string, 
    @Param('id') walletId: string
  ): Promise<Wallet> {
    return this.walletService.getWallet(userId, walletId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWallet(
    @Headers('X-User-ID') userId: string, 
    @Param('id') walletId: string
  ): Promise<void> {
    return this.walletService.deleteWallet(userId, walletId);
  }

  @Get(':walletId/value')
  async getTotalWalletValue(
    @Headers('X-User-ID') userId: string,
    @Param('walletId') walletId: string,
    @Query('currency') currency: string
  ): Promise<WalletTotalValue> {
    validateCurrency(currency);
    
    return await this.walletService.calculateTotalValue(userId, walletId, currency);
  }
}