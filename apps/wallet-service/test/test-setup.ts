import { TestingModule, Test } from '@nestjs/testing';
import { UserAssetsService } from '../src/services/user-assets.service';
import { WalletService } from '../src/services/wallet-service.service';
import { RateService } from '../src/services/rate-service-api.service';
import { UserWalletsFileManagementService, WalletFileManagementService } from '@shared/file-management';
import { WalletSystemLogger } from '@shared/logging';

export async function createTestModule() {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UserAssetsService,
      WalletService,
      WalletSystemLogger,
      {
        provide: WalletFileManagementService,
        useValue: {
          getWallet: jest.fn(),
          saveWallet: jest.fn(),
        },
      },
      {
        provide: UserWalletsFileManagementService,
        useValue: {
          getUserWalletIds: jest.fn(),
          addUserWallet: jest.fn(),
        },
      },
      {
        provide: RateService,
        useValue: {
          getAssetRates: jest.fn(),
        },
      },
    ],
  }).compile();

  const userAssetsService = module.get<UserAssetsService>(UserAssetsService);
  const walletService = module.get<WalletService>(WalletService);
  const rateService = module.get<RateService>(RateService);
  const walletFileManagementService = module.get<WalletFileManagementService>(WalletFileManagementService);
  const userWalletsFileManagementService = module.get<UserWalletsFileManagementService>(UserWalletsFileManagementService);

  return {
    module,
    userAssetsService,
    walletService,
    rateService,
    walletFileManagementService,
    userWalletsFileManagementService,
  };
}
