import {
  AssetNotFoundException,
  InsufficientAssetAmountException,
  MaxWalletsExceededException,
  UnauthorizedWalletAccessException,
  WalletNotFoundException,
} from '@shared/exceptions';
import { Wallet } from '@shared/models';
import { AddAssetDto } from './dtos/add-asset-request.dto';
import config from '../config/wallet-service.config';
import { WalletSystemLogger } from '@shared/logging';
import { FileManagementService } from '@shared/file-management';
import { RateService } from './rate-service-api.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RemoveAssetDto } from './dtos/remove-asset-request.dto';
import { WalletTotalValue } from '@shared/models/wallet-total-value.model';
import { UserAssetsTotalValue } from '@shared/models/user-wallets-total-value.model';

@Injectable()
export class WalletService {
  constructor(
    private readonly rateService: RateService,
    private readonly fileManagementService: FileManagementService,
    private readonly logger: WalletSystemLogger,
  ) {}

  private async getAllWallets(): Promise<Record<string, Wallet>> {
    return (
      (await this.fileManagementService.readFromFile<Record<string, Wallet>>(
        config.fileNames.walletsFile,
      )) || {}
    );
  }

  private async saveAllWallets(wallets: Record<string, Wallet>): Promise<void> {
    await this.fileManagementService.saveToFile(
      config.fileNames.walletsFile,
      wallets,
    );
  }

  private async getAllUserWallets(): Promise<Record<string, string[]>> {
    return (
      (await this.fileManagementService.readFromFile<Record<string, string[]>>(
        config.fileNames.usersFile,
      )) || {}
    );
  }

  private async saveAllUserWallets(
    userWallets: Record<string, string[]>,
  ): Promise<void> {
    await this.fileManagementService.saveToFile(
      config.fileNames.usersFile,
      userWallets,
    );
  }

  private async verifyUserWallet(
    userId: string,
    walletId: string,
  ): Promise<void> {
    const userWallets = await this.getAllUserWallets();
    if (!userWallets[userId] || !userWallets[userId].includes(walletId)) {
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

    const userWallets = await this.getAllUserWallets();
    if (!userWallets[userId]) {
      userWallets[userId] = [];
    }
    if (userWallets[userId].length >= config.wallet.maxWalletsPerUser) {
      this.logger.warn(`User exceeded max wallet limit`, WalletService.name, {
        userId,
        walletId,
      });
      throw new MaxWalletsExceededException(
        userId,
        config.wallet.maxWalletsPerUser,
      );
    }

    // Add the wallet ID to the user's list of wallets
    userWallets[userId].push(walletId);
    await this.saveAllUserWallets(userWallets);

    // Add the wallet to the wallets collection
    const newWallet: Wallet = {
      id: walletId,
      userId,
      cryptoAssets: {}, // Updated to use map for assets
      lastUpdated: new Date(),
    };

    const allWallets = await this.getAllWallets();
    allWallets[walletId] = newWallet;
    await this.saveAllWallets(allWallets);

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

    const allWallets = await this.getAllWallets();
    const wallet = allWallets[walletId];
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

    // Delete the wallet from the wallets collection
    const allWallets = await this.getAllWallets();
    delete allWallets[walletId];
    await this.saveAllWallets(allWallets);

    // Remove the wallet ID from the user's list of wallets
    const userWallets = await this.getAllUserWallets();

    userWallets[userId] = userWallets[userId].filter((id) => id !== walletId);

    await this.saveAllUserWallets(userWallets);

    this.logger.log(`Wallet deleted successfully`, WalletService.name, {
      userId,
      walletId,
    });
  }

  async addAsset(
    userId: string,
    walletId: string,
    addAssetDto: AddAssetDto,
  ): Promise<Wallet> {
    const wallet = await this.getWallet(userId, walletId);

    if (wallet.cryptoAssets[addAssetDto.assetId]) {
      // Asset exists, update its value
      wallet.cryptoAssets[addAssetDto.assetId] += addAssetDto.amount;
      this.logger.log(`Updated asset in wallet`, WalletService.name, {
        userId,
        walletId,
        assetId: addAssetDto.assetId,
        value: wallet.cryptoAssets[addAssetDto.assetId],
      });
    } else {
      // Add new asset to the wallet
      wallet.cryptoAssets[addAssetDto.assetId] = addAssetDto.amount;
      this.logger.log(`Added new asset to wallet`, WalletService.name, {
        userId,
        walletId,
        assetId: addAssetDto.assetId,
        value: addAssetDto.amount,
      });
    }

    const allWallets = await this.getAllWallets();
    allWallets[walletId] = wallet;
    await this.saveAllWallets(allWallets);
    return wallet;
  }

  async removeAsset(
    userId: string,
    walletId: string,
    removeAssetDto: RemoveAssetDto,
  ): Promise<Wallet> {
    const wallet = await this.getWallet(userId, walletId);

    const assetAmount = wallet.cryptoAssets[removeAssetDto.assetId];
    if (!assetAmount) {
      throw new AssetNotFoundException(removeAssetDto.assetId, walletId);
    }

    if (assetAmount < removeAssetDto.amount) {
      throw new InsufficientAssetAmountException(
        removeAssetDto.assetId,
        assetAmount,
        removeAssetDto.amount,
      );
    }

    wallet.cryptoAssets[removeAssetDto.assetId] -= removeAssetDto.amount;

    if (wallet.cryptoAssets[removeAssetDto.assetId] === 0) {
      delete wallet.cryptoAssets[removeAssetDto.assetId]; // Remove asset if amount is zero
    }

    const allWallets = await this.getAllWallets();
    allWallets[walletId] = wallet;
    await this.saveAllWallets(allWallets);
    this.logger.log(
      `Asset ${removeAssetDto.assetId} updated in wallet ${walletId} for user ${userId}`,
      WalletService.name,
    );

    return wallet;
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

    // Use getRatesMap to get the rates for the specified currency
    const ratesMap = await this.getRatesMap(wallet, currency);

    // Calculate the total value of the wallet in the specified currency
    const totalValue = Object.entries(wallet.cryptoAssets).reduce(
      (sum, [assetId, amount]) => {
        const rate = ratesMap[assetId];
        return sum + amount * rate;
      },
      0,
    );

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

  async calculateTotalUserAssetsValue(
    userId: string,
    currency: string,
  ): Promise<UserAssetsTotalValue> {
    this.logger.log(`Calculating total user assets value`, WalletService.name, {
      userId,
      currency,
    });

    // Retrieve all wallet IDs for the user
    const allUserWallets = await this.getAllUserWallets();
    const walletIds = allUserWallets[userId] || [];

    let totalValue = 0;
    const walletDetails: WalletTotalValue[] = [];

    // Loop through each wallet ID and calculate its total value
    for (const walletId of walletIds) {
      const walletDetail = await this.calculateTotalValue(
        userId,
        walletId,
        currency,
      );

      // Accumulate the wallet details and total value
      walletDetails.push(walletDetail);
      totalValue += walletDetail.totalValue;
    }

    this.logger.log(`Total user assets value calculated`, WalletService.name, {
      userId,
      currency,
      totalValue,
    });

    return { wallets: walletDetails, totalValue, currency };
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
    for (const [assetId, amount] of Object.entries(wallet.cryptoAssets)) {
      const targetPercentage = targetPercentages[assetId] || 0; // Default to 0 if not specified
      const targetValue = (targetPercentage / 100) * totalValue; // Target value based on the percentage

      // Determine the target amount of the asset based on its target value
      const targetAmount = targetValue / ratesMap[assetId];

      // Adjust the asset amount in the wallet
      if (targetAmount > amount) {
        const addAmount = targetAmount - amount;
        await this.addAsset(userId, walletId, {
          assetId: assetId,
          amount: addAmount,
        });
      } else if (targetAmount < amount) {
        const removeAmount = amount - targetAmount;
        await this.removeAsset(userId, walletId, {
          assetId: assetId,
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
    const assetIds = Object.keys(wallet.cryptoAssets);
    const ratesResponse = await this.rateService.getAssetRates(
      assetIds,
      currency,
    );

    return ratesResponse.reduce(
      (acc, rate) => {
        acc[rate.assetId] = rate.value;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
