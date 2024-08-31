import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { UserWallets, CryptoAsset, Wallet} from '../models';


@Injectable()
export class FileManagementService {
  private readonly usersDir = path.join(__dirname, '..', 'data', 'users');
  private readonly walletsDir = path.join(__dirname, '..', 'data', 'wallets');

  constructor() {
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist() {
    if (!fs.existsSync(this.usersDir)) {
      fs.mkdirSync(this.usersDir, { recursive: true });
    }
    if (!fs.existsSync(this.walletsDir)) {
      fs.mkdirSync(this.walletsDir, { recursive: true });
    }
  }

  saveWalletAssets(walletId: string, userId: string, cryptoAssets: CryptoAsset[]): void {
    const filePath = path.join(this.walletsDir, `${walletId}.json`);
    const walletAssets: Wallet = { walletId, userId, cryptoAssets };
    fs.writeFileSync(filePath, JSON.stringify(walletAssets, null, 2), 'utf8');
  }
}
