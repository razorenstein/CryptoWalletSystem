import { Injectable } from '@nestjs/common';
import { Wallet } from '@shared/models';
import { WalletNotFoundException, UnauthorizedWalletAccessException, MaxWalletsExceededException } from '@shared/exceptions';
import { WalletTotalValue } from '../models/wallet-total-value.model';
import { RateService } from './rate-service-api.service';
import { WalletSystemLogger } from '@shared/logging';
import { WalletFileManagementService, UserWalletsFileManagementService } from '@shared/file-management';
import config from '../config/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WalletService {
  constructor(
    private readonly rateService: RateService,
    private readonly userWalletsFileManagementService: UserWalletsFileManagementService,
    private readonly walletFileManagementService: WalletFileManagementService,
    private readonly logger: WalletSystemLogger
  ) {}

  private async verifyUserWallet(userId: string, walletId: string): Promise<void> {
    const userWallets = await this.userWalletsFileManagementService.getUserWalletIds(userId);
    if (!userWallets || !userWallets.includes(walletId)) {
      this.logger.warn(`Unauthorized access attempt`, WalletService.name, { userId, walletId });
      throw new UnauthorizedWalletAccessException(walletId, userId);
    }
  }

  async createWallet(userId: string): Promise<Wallet> {
    this.logger.log(`Creating wallet`, WalletService.name, { userId });
    
    const walletId = uuidv4(); 
    
    //Check how many wallets the user already has
    const userWallets = await this.userWalletsFileManagementService.getUserWalletIds(userId);
    if (userWallets && userWallets.length >= config.wallet.maxWalletsPerUser) {
      this.logger.warn(`User exceeded max wallet limit`, WalletService.name, { userId, walletId });
      throw new MaxWalletsExceededException(userId, config.wallet.maxWalletsPerUser);
    }

    //Add the wallet ID to the user's list of wallets
    await this.userWalletsFileManagementService.addUserWallet(userId, walletId);

    //Create the new wallet and save it
    const newWallet: Wallet = { id: walletId, userId, cryptoAssets: [], lastUpdated: new Date() };
    await this.walletFileManagementService.saveWallet(newWallet);

    this.logger.log(`Wallet created successfully`, WalletService.name, { userId, walletId });
    return newWallet;
  }

  async getWallet(userId: string, walletId: string): Promise<Wallet> {
    this.logger.log(`Retrieving wallet`, WalletService.name, { userId, walletId });

    await this.verifyUserWallet(userId, walletId);

    const wallet = await this.walletFileManagementService.getWallet(walletId);
    if (!wallet) {
      this.logger.warn(`Wallet not found`, WalletService.name, { userId, walletId });
      throw new WalletNotFoundException(walletId, userId);
    }

    this.logger.log(`Wallet retrieved successfully`, WalletService.name, { userId, walletId });
    return wallet;
  }

  async deleteWallet(userId: string, walletId: string): Promise<void> {
    this.logger.log(`Deleting wallet`, WalletService.name, { userId, walletId });

    await this.verifyUserWallet(userId, walletId);

    await this.walletFileManagementService.deleteWallet(userId, walletId);
    await this.userWalletsFileManagementService.removeUserWallet(userId, walletId);

    this.logger.log(`Wallet deleted successfully`, WalletService.name, { userId, walletId });
  }

  async calculateTotalValue(userId: string, walletId: string, currency: string): Promise<WalletTotalValue> {
    this.logger.log(`Calculating total value`, WalletService.name, { userId, walletId, currency });

    // Verify that the wallet belongs to the user
    await this.verifyUserWallet(userId, walletId);

    // Retrieve the wallet
    const wallet = await this.getWallet(userId, walletId);
    const assetIds = wallet.cryptoAssets.map(asset => asset.id);

    // Get the rates for the specified currency
    const ratesResponse = await this.rateService.getAssetRates(assetIds, currency);

    // Create a map of assetId to rate value for quick lookup
    const ratesMap = ratesResponse.rates.reduce((acc, rate) => {
      acc[rate.assetId] = rate.value;
      return acc;
    }, {} as Record<string, number>);

    // Calculate the total value of the wallet in the specified currency
    const totalValue = wallet.cryptoAssets.reduce((sum, asset) => {
      const rate = ratesMap[asset.id];
      return sum + (asset.amount * rate);
    }, 0);

    this.logger.log(`Total value calculated`, WalletService.name, { userId, walletId, currency, totalValue });

    return {
      wallet,
      totalValue,
      currency,
    };
  }
}