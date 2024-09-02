import { Injectable } from '@nestjs/common';
import { WalletFileManagementService } from '@shared/file-management';
import { AddAssetDto } from './dtos/requests/add-asset-request.dto';
import { RemoveAssetDto } from './dtos/requests/remove-asset-request.dto';
import { AssetNotFoundException, WalletNotFoundException } from '@shared/exceptions';
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

        const assetIndex = wallet.cryptoAssets.findIndex((asset) => asset.symbol === addAssetDto.assetId);
        if (assetIndex !== -1) {
            // Asset exists, update its value
            wallet.cryptoAssets[assetIndex].amount += addAssetDto.amount;
            this.logger.log(`Updated asset in wallet`, WalletAssetService.name, { userId, walletId, assetId: addAssetDto.assetId, value: wallet.cryptoAssets[assetIndex].amount });
        } else {
            // Add new asset to the wallet
            const newAsset: CryptoAsset = {
            symbol: addAssetDto.assetId,
            amount: addAssetDto.amount,
            };
            wallet.cryptoAssets.push(newAsset);
            this.logger.log(`Added new asset to wallet`, WalletAssetService.name, { userId, walletId, assetId: newAsset.symbol, value: newAsset.amount });
        }

        await this.walletFileManagementService.saveWallet(wallet);
        return wallet;
    }

    async removeAsset(userId: string, walletId: string, removeAssetDto: RemoveAssetDto): Promise<Wallet> {
        const wallet = await this.walletFileManagementService.getWallet(walletId);

        if (!wallet) {
            this.logger.warn(`Wallet not found for removing asset`, WalletAssetService.name, { userId, walletId });
            throw new WalletNotFoundException(walletId, userId);
        }

        const assetIndex = wallet.cryptoAssets.findIndex((asset) => asset.symbol === removeAssetDto.assetId);
        if (assetIndex === -1) {
            this.logger.warn(`Asset not found in wallet`, WalletAssetService.name, { userId, walletId, assetId: removeAssetDto.assetId });
            throw new AssetNotFoundException(removeAssetDto.assetId, walletId);
        }

        wallet.cryptoAssets.splice(assetIndex, 1); // Remove the asset from the wallet
        this.logger.log(`Removed asset from wallet`, WalletAssetService.name, { userId, walletId, assetId: removeAssetDto.assetId });

        await this.walletFileManagementService.saveWallet(wallet);
        return wallet;
    }
}
