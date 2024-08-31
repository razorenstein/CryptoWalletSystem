import { Controller, Get, Post, Body, Param, Headers, UseInterceptors } from '@nestjs/common';
import { WalletService } from '../services/wallet-service.service';
import { CryptoAsset } from '@shared/models';
import { AddWalletRequestDto } from '../dtos/add-wallet-request.dto';

@Controller("wallet")
export class WalletServiceController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  addWallet(@Body() walletRequestDto: AddWalletRequestDto) {
    return this.walletService.addWallet(walletRequestDto.userId, walletRequestDto.walletId);
  }
}
