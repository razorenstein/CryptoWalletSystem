import { Injectable } from '@nestjs/common';
import { Wallet, CryptoAsset } from '@shared/models';
import { FileManagementService } from '@shared/file-management';


@Injectable()
export class WalletService {
  constructor(private readonly fileManagementService: FileManagementService) {}
  
  addWallet(userId: string, walletId: string): Wallet {
    this.fileManagementService.addUserWallet(userId, walletId);

    const newWallet: Wallet = {
      walletId: walletId,
      userId: userId,
      cryptoAssets: [], 
    };

    this.fileManagementService.saveWalletAssets(walletId, newWallet.userId, newWallet.cryptoAssets);

    return newWallet;
  }
}