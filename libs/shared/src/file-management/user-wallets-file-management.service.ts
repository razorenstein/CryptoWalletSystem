import { Injectable } from '@nestjs/common';
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
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
      this.logger.log(`Created directory`, UserWalletsFileManagementService.name, { directoryPath, context });
    }
  }

  private getUserFilePath(userId: string): string {
    return path.join(this.usersDir, `${userId}.json`);
  }

  async saveUserWallets(userId: string, walletIds: string[]): Promise<void> {
    const filePath = this.getUserFilePath(userId);
    fs.writeFileSync(filePath, JSON.stringify(walletIds, null, 2), { encoding: 'utf8' });
    this.logger.log(`Saved wallets for user`, UserWalletsFileManagementService.name, { userId, walletIds });
  }

  async getUserWallets(userId: string): Promise<string[] | null> {
    const filePath = this.getUserFilePath(userId);
    if (fs.existsSync(filePath)) {
      const walletIdsData = fs.readFileSync(filePath, { encoding: 'utf8' });
      this.logger.log(`Retrieved wallets for user`, UserWalletsFileManagementService.name, { userId });
      return JSON.parse(walletIdsData);
    }
    this.logger.warn(`No wallets found for user`, UserWalletsFileManagementService.name, { userId });
    return null;
  }

  async addUserWallet(userId: string, walletId: string): Promise<void> {
    const walletIds = await this.getUserWallets(userId) || [];
    if (!walletIds.includes(walletId)) {
      walletIds.push(walletId);
      await this.saveUserWallets(userId, walletIds);
      this.logger.log(`Added wallet for user`, UserWalletsFileManagementService.name, { userId, walletId });
    }
  }

  async removeUserWallet(userId: string, walletId: string): Promise<void> {
    const walletIds = await this.getUserWallets(userId);
    if (walletIds) {
      const updatedWalletIds = walletIds.filter(id => id !== walletId);
      await this.saveUserWallets(userId, updatedWalletIds);
      this.logger.log(`Removed wallet for user`, UserWalletsFileManagementService.name, { userId, walletId });
    }
  }
}