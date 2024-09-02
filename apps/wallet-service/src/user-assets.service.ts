import { Injectable, Logger } from '@nestjs/common';
import { WalletService } from './wallet-service.service';
import { WalletTotalValue } from './models/wallet-total-value.model';
import { UserAssetsTotalValue } from './models/user-wallets-total-value.model';
import { UserWalletsFileManagementService } from '@shared/file-management';

@Injectable()
export class UserAssetsService {
  private readonly logger = new Logger(UserAssetsService.name);

  constructor(
    private readonly walletService: WalletService,
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
}
