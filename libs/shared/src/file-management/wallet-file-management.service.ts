import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { WalletNotFoundException } from '@shared/exceptions';
import { Wallet } from '../models';
import { WalletSystemLogger } from '../logging';

@Injectable()
export class WalletFileManagementService {
  private readonly walletsDir = path.join(__dirname, '../../../data/wallets');

  constructor(private readonly logger: WalletSystemLogger) {
    this.createDirectoryIfNotExists(this.walletsDir, 'wallets');
  }

  private createDirectoryIfNotExists(directoryPath: string, context: string) {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
      this.logger.log(`Created directory`, WalletFileManagementService.name, { directoryPath, context });
    }
  }

  private getWalletFilePath(walletId: string): string {
    return path.join(this.walletsDir, `${walletId}.json`);
  }

  async saveWallet(wallet: Wallet): Promise<void> {
    const filePath = this.getWalletFilePath(wallet.id);
    wallet.lastUpdated = new Date(); // Update lastUpdated field
    fs.writeFileSync(filePath, JSON.stringify(wallet, null, 2), { encoding: 'utf8' });
    this.logger.log(`Saved wallet`, WalletFileManagementService.name, { walletId: wallet.id, lastUpdated: wallet.lastUpdated });
  }

  async getWallet(walletId: string): Promise<Wallet | null> {
    const filePath = this.getWalletFilePath(walletId);
    if (fs.existsSync(filePath)) {
      const walletData = fs.readFileSync(filePath, { encoding: 'utf8' });
      this.logger.log(`Retrieved wallet`, WalletFileManagementService.name, { walletId });
      return JSON.parse(walletData);
    }
    this.logger.warn(`Wallet not found`, WalletFileManagementService.name, { walletId });
    return null;
  }

  async deleteWallet(userId: string, walletId: string): Promise<void> {
    const filePath = this.getWalletFilePath(walletId);
    if (!fs.existsSync(filePath)) {
      this.logger.warn(`Attempted to delete non-existing wallet`, WalletFileManagementService.name, { walletId });
      throw new WalletNotFoundException(walletId, userId);
    }
    fs.unlinkSync(filePath);
    this.logger.log(`Deleted wallet`, WalletFileManagementService.name, { walletId });
  }
}
