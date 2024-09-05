import { Injectable } from '@nestjs/common';
import { WalletFileManagementService } from '@shared/file-management';
import { AddAssetDto } from '../dtos/requests/add-asset-request.dto';
import { RemoveAssetDto } from '../dtos/requests/remove-asset-request.dto';
import { AssetNotFoundException, WalletNotFoundException, InsufficientAssetAmountException } from '@shared/exceptions';
import { WalletSystemLogger } from '@shared/logging';
import { Wallet, CryptoAsset } from '@shared/models';

@Injectable()
export class WalletAssetService {
  constructor(
    private readonly walletFileManagementService: WalletFileManagementService,
    private readonly logger: WalletSystemLogger,
  ) {}

    async addAsset(userId: string, walletId: string, addAssetDto: AddAssetDto): Promise<Wallet> {
        const wallet = await this.walletFileManagementService.getWallet(walletId);

        if (!wallet) {
            this.logger.warn(`Wallet not found for adding asset`, WalletAssetService.name, { userId, walletId });
            throw new WalletNotFoundException(walletId, userId);
        }

        const assetIndex = wallet.cryptoAssets.findIndex((asset) => asset.id === addAssetDto.assetId);
        if (assetIndex !== -1) {
            // Asset exists, update its value
            wallet.cryptoAssets[assetIndex].amount += addAssetDto.amount;
            this.logger.log(`Updated asset in wallet`, WalletAssetService.name, { userId, walletId, assetId: addAssetDto.assetId, value: wallet.cryptoAssets[assetIndex].amount });
        } else {
            // Add new asset to the wallet
            const newAsset: CryptoAsset = {
            id: addAssetDto.assetId,
            amount: addAssetDto.amount,
            };
            wallet.cryptoAssets.push(newAsset);
            this.logger.log(`Added new asset to wallet`, WalletAssetService.name, { userId, walletId, assetId: newAsset.id, value: newAsset.amount });
        }

        await this.walletFileManagementService.saveWallet(wallet);
        return wallet;
    }

    async removeAsset(userId: string, walletId: string, removeAssetDto: RemoveAssetDto): Promise<Wallet> {
        const wallet = await this.walletFileManagementService.getWallet(walletId);
        if (!wallet) 
            throw new WalletNotFoundException(walletId, userId);
      
        const asset = wallet.cryptoAssets.find(asset => asset.id === removeAssetDto.assetId);
        if (!asset) 
            throw new AssetNotFoundException(removeAssetDto.assetId, walletId);
      
        if (asset.amount < removeAssetDto.amount) {
          throw new InsufficientAssetAmountException(removeAssetDto.assetId, asset.amount, removeAssetDto.amount);
        }
      
        asset.amount -= removeAssetDto.amount;
        if (asset.amount === 0)
          wallet.cryptoAssets = wallet.cryptoAssets.filter(a => a.id !== removeAssetDto.assetId); 
      
        await this.walletFileManagementService.saveWallet(wallet);
        this.logger.log(`Asset ${removeAssetDto.assetId} updated in wallet ${walletId} for user ${userId}`, WalletAssetService.name);
      
        return wallet;
    }
}
