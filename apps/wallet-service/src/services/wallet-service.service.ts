import { Injectable } from '@nestjs/common';
import { CryptoAsset, Wallet } from '@shared/models';
import {
  WalletNotFoundException,
  UnauthorizedWalletAccessException,
  MaxWalletsExceededException,
  AssetNotFoundException,
  InsufficientAssetAmountException,
} from '@shared/exceptions';
import { RateService } from './rate-service-api.service';
import { WalletSystemLogger } from '@shared/logging';
import {
  WalletFileManagementService,
  UserWalletsFileManagementService,
} from '@shared/file-management';
import config from '../config/config';
import { v4 as uuidv4 } from 'uuid';
import { RemoveAssetDto } from '../dtos/remove-asset-request.dto';
import { AddAssetDto } from '../dtos/add-asset-request.dto';
import { WalletTotalValue } from '@shared/models/wallet-total-value.model';

@Injectable()
export class WalletService {
  constructor(
    private readonly rateService: RateService,
    private readonly userWalletsFileManagementService: UserWalletsFileManagementService,
    private readonly walletFileManagementService: WalletFileManagementService,
    private readonly logger: WalletSystemLogger,
  ) {}

  private async verifyUserWallet(
    userId: string,
    walletId: string,
  ): Promise<void> {
    const userWallets =
      await this.userWalletsFileManagementService.getUserWalletIds(userId);
    if (!userWallets || !userWallets.includes(walletId)) {
      this.logger.warn(`Unauthorized access attempt`, WalletService.name, {
        userId,
        walletId,
      });
      throw new UnauthorizedWalletAccessException(walletId, userId);
    }
  }

  async createWallet(userId: string): Promise<Wallet> {
    this.logger.log(`Creating wallet`, WalletService.name, { userId });

    const walletId = uuidv4();

    //Check how many wallets the user already has
    const userWallets =
      await this.userWalletsFileManagementService.getUserWalletIds(userId);
    if (userWallets && userWallets.length >= config.wallet.maxWalletsPerUser) {
      this.logger.warn(`User exceeded max wallet limit`, WalletService.name, {
        userId,
        walletId,
      });
      throw new MaxWalletsExceededException(
        userId,
        config.wallet.maxWalletsPerUser,
      );
    }

    //Add the wallet ID to the user's list of wallets
    await this.userWalletsFileManagementService.addUserWallet(userId, walletId);

    //Create the new wallet and save it
    const newWallet: Wallet = {
      id: walletId,
      userId,
      cryptoAssets: [],
      lastUpdated: new Date(),
    };
    await this.walletFileManagementService.saveWallet(newWallet);

    this.logger.log(`Wallet created successfully`, WalletService.name, {
      userId,
      walletId,
    });
    return newWallet;
  }

  async getWallet(userId: string, walletId: string): Promise<Wallet> {
    this.logger.log(`Retrieving wallet`, WalletService.name, {
      userId,
      walletId,
    });

    await this.verifyUserWallet(userId, walletId);

    const wallet = await this.walletFileManagementService.getWallet(walletId);
    if (!wallet) {
      this.logger.warn(`Wallet not found`, WalletService.name, {
        userId,
        walletId,
      });
      throw new WalletNotFoundException(walletId, userId);
    }

    this.logger.log(`Wallet retrieved successfully`, WalletService.name, {
      userId,
      walletId,
    });
    return wallet;
  }

  async deleteWallet(userId: string, walletId: string): Promise<void> {
    this.logger.log(`Deleting wallet`, WalletService.name, {
      userId,
      walletId,
    });

    await this.verifyUserWallet(userId, walletId);

    await this.walletFileManagementService.deleteWallet(userId, walletId);
    await this.userWalletsFileManagementService.removeUserWallet(
      userId,
      walletId,
    );

    this.logger.log(`Wallet deleted successfully`, WalletService.name, {
      userId,
      walletId,
    });
  }

  async calculateTotalValue(
    userId: string,
    walletId: string,
    currency: string,
  ): Promise<WalletTotalValue> {
    this.logger.log(`Calculating total value`, WalletService.name, {
      userId,
      walletId,
      currency,
    });

    // Verify that the wallet belongs to the user
    await this.verifyUserWallet(userId, walletId);

    // Retrieve the wallet
    const wallet = await this.getWallet(userId, walletId);
    const assetIds = wallet.cryptoAssets.map((asset) => asset.id);

    // Get the rates for the specified currency
    const ratesResponse = await this.rateService.getAssetRates(
      assetIds,
      currency,
    );

    // Create a map of assetId to rate value for quick lookup
    const ratesMap = ratesResponse.rates.reduce(
      (acc, rate) => {
        acc[rate.assetId] = rate.value;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate the total value of the wallet in the specified currency
    const totalValue = wallet.cryptoAssets.reduce((sum, asset) => {
      const rate = ratesMap[asset.id];
      return sum + asset.amount * rate;
    }, 0);

    this.logger.log(`Total value calculated`, WalletService.name, {
      userId,
      walletId,
      currency,
      totalValue,
    });

    return {
      wallet,
      totalValue,
      currency,
    };
  }

  async addAsset(
    userId: string,
    walletId: string,
    addAssetDto: AddAssetDto,
  ): Promise<Wallet> {
    const wallet = await this.walletFileManagementService.getWallet(walletId);

    if (!wallet) {
      this.logger.warn(
        `Wallet not found for adding asset`,
        WalletService.name,
        { userId, walletId },
      );
      throw new WalletNotFoundException(walletId, userId);
    }

    const assetIndex = wallet.cryptoAssets.findIndex(
      (asset) => asset.id === addAssetDto.assetId,
    );
    if (assetIndex !== -1) {
      // Asset exists, update its value
      wallet.cryptoAssets[assetIndex].amount += addAssetDto.amount;
      this.logger.log(`Updated asset in wallet`, WalletService.name, {
        userId,
        walletId,
        assetId: addAssetDto.assetId,
        value: wallet.cryptoAssets[assetIndex].amount,
      });
    } else {
      // Add new asset to the wallet
      const newAsset: CryptoAsset = {
        id: addAssetDto.assetId,
        amount: addAssetDto.amount,
      };
      wallet.cryptoAssets.push(newAsset);
      this.logger.log(`Added new asset to wallet`, WalletService.name, {
        userId,
        walletId,
        assetId: newAsset.id,
        value: newAsset.amount,
      });
    }

    await this.walletFileManagementService.saveWallet(wallet);
    return wallet;
  }

  async removeAsset(
    userId: string,
    walletId: string,
    removeAssetDto: RemoveAssetDto,
  ): Promise<Wallet> {
    const wallet = await this.walletFileManagementService.getWallet(walletId);
    if (!wallet) throw new WalletNotFoundException(walletId, userId);

    const asset = wallet.cryptoAssets.find(
      (asset) => asset.id === removeAssetDto.assetId,
    );
    if (!asset)
      throw new AssetNotFoundException(removeAssetDto.assetId, walletId);

    if (asset.amount < removeAssetDto.amount)
      throw new InsufficientAssetAmountException(
        removeAssetDto.assetId,
        asset.amount,
        removeAssetDto.amount,
      );

    asset.amount -= removeAssetDto.amount;
    if (asset.amount === 0)
      wallet.cryptoAssets = wallet.cryptoAssets.filter(
        (a) => a.id !== removeAssetDto.assetId,
      );

    await this.walletFileManagementService.saveWallet(wallet);
    this.logger.log(
      `Asset ${removeAssetDto.assetId} updated in wallet ${walletId} for user ${userId}`,
      WalletService.name,
    );

    return wallet;
  }

  async rebalance(
    userId: string,
    walletId: string,
    targetPercentages: Record<string, number>,
  ): Promise<void> {
    this.logger.log(`Rebalancing wallet`, WalletService.name, {
      userId,
      walletId,
      targetPercentages,
    });

    // Calculate the current total value of the wallet
    const { wallet, totalValue, currency } = await this.calculateTotalValue(
      userId,
      walletId,
      'USD',
    );
    const ratesMap = await this.getRatesMap(wallet, currency);

    // Calculate the target value for each asset and adjust accordingly
    for (const asset of wallet.cryptoAssets) {
      const targetPercentage = targetPercentages[asset.id] || 0; // Default to 0 if not specified
      const targetValue = (targetPercentage / 100) * totalValue; // Target value based on the percentage

      // Determine the target amount of the asset based on its target value
      const targetAmount = targetValue / ratesMap[asset.id];

      // Adjust the asset amount in the wallet
      if (targetAmount > asset.amount) {
        const addAmount = targetAmount - asset.amount;
        await this.addAsset(userId, walletId, {
          assetId: asset.id,
          amount: addAmount,
        });
      } else if (targetAmount < asset.amount) {
        const removeAmount = asset.amount - targetAmount;
        await this.removeAsset(userId, walletId, {
          assetId: asset.id,
          amount: removeAmount,
        });
      }
    }

    this.logger.log(
      `Rebalance complete for wallet ${walletId}`,
      WalletService.name,
    );
  }

  private async getRatesMap(
    wallet: Wallet,
    currency: string,
  ): Promise<Record<string, number>> {
    const assetIds = wallet.cryptoAssets.map((asset) => asset.id);
    const ratesResponse = await this.rateService.getAssetRates(
      assetIds,
      currency,
    );

    return ratesResponse.rates.reduce(
      (acc, rate) => {
        acc[rate.assetId] = rate.value;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
