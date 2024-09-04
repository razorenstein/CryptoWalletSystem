import { Injectable, Logger } from '@nestjs/common';
import { WalletService } from './wallet-service.service';
import { WalletTotalValue } from '../models/wallet-total-value.model';
import { UserAssetsTotalValue } from '../models/user-wallets-total-value.model';
import { UserWalletsFileManagementService } from '@shared/file-management';
import { CryptoAsset, Wallet } from '@shared/models';
import { WalletAssetService } from './wallet-asset-service.service';
import { RateService } from './rate-service-api.service';

@Injectable()
export class UserAssetsService {
  private readonly logger = new Logger(UserAssetsService.name);

  constructor(
    private readonly walletService: WalletService,
    private readonly rateService: RateService,
    private readonly walletAssetService: WalletAssetService,
    private readonly userWalletsFileManagementService: UserWalletsFileManagementService 
  ) {}

  async calculateTotalUserAssetsValue(userId: string, currency: string): Promise<UserAssetsTotalValue> {
    this.logger.log(`Calculating total user assets value`, UserAssetsService.name, { userId, currency });

    // Retrieve all wallet IDs for the user
    const walletIds = await this.userWalletsFileManagementService.getUserWalletIds(userId);

    let totalValue = 0;
    const walletDetails: WalletTotalValue[] = [];

    // Loop through each wallet ID and calculate its total value
    for (const walletId of walletIds) {
      const walletDetail = await this.walletService.calculateTotalValue(userId, walletId, currency);

      // Accumulate the wallet details and total value
      walletDetails.push(walletDetail);
      totalValue += walletDetail.totalValue;
    }

    this.logger.log(`Total user assets value calculated`, UserAssetsService.name, { userId, currency, totalValue });

    return {
      wallets: walletDetails,
      totalValue,
      currency
    };
  }

  async rebalance(userId: string, walletId: string, targetPercentages: Record<string, number>): Promise<void> {
    this.logger.log(`Rebalancing wallet`, UserAssetsService.name, { userId, walletId, targetPercentages });
  
    // Calculate the current total value of the wallet
    const { wallet, totalValue, currency } = await this.walletService.calculateTotalValue(userId, walletId, 'USD');
    const ratesMap = await this.getRatesMap(wallet, currency);
  
    // Calculate the target value for each asset and adjust accordingly
    for (const asset of wallet.cryptoAssets) {
      const targetPercentage = targetPercentages[asset.id] || 0;  // Default to 0 if not specified
      const targetValue = (targetPercentage / 100) * totalValue;  // Target value based on the percentage
  
      // Determine the target amount of the asset based on its target value
      const targetAmount = targetValue / ratesMap[asset.id];
  
      // Adjust the asset amount in the wallet
      if (targetAmount > asset.amount) {
        const addAmount = targetAmount - asset.amount;
        await this.walletAssetService.addAsset(userId, walletId, { assetId: asset.id, amount: addAmount });
      } else if (targetAmount < asset.amount) {
        const removeAmount = asset.amount - targetAmount;
        await this.walletAssetService.removeAsset(userId, walletId, { assetId: asset.id, amount: removeAmount });
      }
    }
  
    this.logger.log(`Rebalance complete for wallet ${walletId}`, UserAssetsService.name);
  }
  
  private async getRatesMap(wallet: Wallet, currency: string): Promise<Record<string, number>> {
    const assetIds = wallet.cryptoAssets.map(asset => asset.id);
    const ratesResponse = await this.rateService.getAssetRates(assetIds, currency);
  
    return ratesResponse.rates.reduce((acc, rate) => {
      acc[rate.assetId] = rate.value;
      return acc;
    }, {} as Record<string, number>);
  }
}