import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { WalletSystemLogger } from '@shared/logging';

@Injectable()
export class UserWalletsFileManagementService {
  private readonly usersDir = path.join(__dirname, '../../../data/users');

  constructor(private readonly logger: WalletSystemLogger) {
    this.createDirectoryIfNotExists(this.usersDir, 'users');
  }

  private createDirectoryIfNotExists(directoryPath: string, context: string) {
    try {
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
        this.logger.log(`Created directory`, UserWalletsFileManagementService.name, { directoryPath, context });
      }
    } catch (error) {
      this.logger.error(`Failed to create directory`, error.stack, UserWalletsFileManagementService.name, { directoryPath, context });
      throw new InternalServerErrorException(`Failed to create directory: ${context}`);
    }
  }

  private getUserFilePath(userId: string): string {
    return path.join(this.usersDir, `${userId}.json`);
  }

  async saveUserWallets(userId: string, walletIds: string[]): Promise<void> {
    const filePath = this.getUserFilePath(userId);
    try {
      fs.writeFileSync(filePath, JSON.stringify(walletIds, null, 2), { encoding: 'utf8' });
      this.logger.log(`Saved wallets for user`, UserWalletsFileManagementService.name, { userId, walletIds });
    } catch (error) {
      this.logger.error(`Failed to save wallets for user`, error.stack, UserWalletsFileManagementService.name, { userId });
      throw new InternalServerErrorException(`Failed to save wallets for user: ${userId}`);
    }
  }

  async getUserWalletIds(userId: string): Promise<string[] | null> {
    const filePath = this.getUserFilePath(userId);
    try {
      if (fs.existsSync(filePath)) {
        const walletIdsData = fs.readFileSync(filePath, { encoding: 'utf8' });
        this.logger.log(`Retrieved wallets for user`, UserWalletsFileManagementService.name, { userId });
        return JSON.parse(walletIdsData);
      } else {
        this.logger.warn(`No wallets found for user`, UserWalletsFileManagementService.name, { userId });
        return null;
      }
    } catch (error) {
      this.logger.error(`Failed to retrieve wallets for user`, error.stack, UserWalletsFileManagementService.name, { userId });
      throw new InternalServerErrorException(`Failed to retrieve wallets for user: ${userId}`);
    }
  }

  async addUserWallet(userId: string, walletId: string): Promise<void> {
    try {
      const walletIds = await this.getUserWalletIds(userId) || [];
      if (!walletIds.includes(walletId)) {
        walletIds.push(walletId);
        await this.saveUserWallets(userId, walletIds);
        this.logger.log(`Added wallet for user`, UserWalletsFileManagementService.name, { userId, walletId });
      }
    } catch (error) {
      this.logger.error(`Failed to add wallet for user`, error.stack, UserWalletsFileManagementService.name, { userId, walletId });
      throw new InternalServerErrorException(`Failed to add wallet for user: ${userId}`);
    }
  }

  async removeUserWallet(userId: string, walletId: string): Promise<void> {
    try {
      const walletIds = await this.getUserWalletIds(userId);
      if (walletIds) {
        const updatedWalletIds = walletIds.filter(id => id !== walletId);
        await this.saveUserWallets(userId, updatedWalletIds);
        this.logger.log(`Removed wallet for user`, UserWalletsFileManagementService.name, { userId, walletId });
      }
    } catch (error) {
      this.logger.error(`Failed to remove wallet for user`, error.stack, UserWalletsFileManagementService.name, { userId, walletId });
      throw new InternalServerErrorException(`Failed to remove wallet for user: ${userId}`);
    }
  }
}