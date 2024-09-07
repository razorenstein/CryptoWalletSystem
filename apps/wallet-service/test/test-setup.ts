import { TestingModule, Test } from '@nestjs/testing';
import { WalletService } from '../src/wallets/wallet-service.service';
import { FileManagementService } from '@shared/file-management';
import { RateService } from '../src/wallets/rate-service-api.service';
import { WalletSystemLogger } from '@shared/logging';

export async function createTestModule() {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      WalletService,
      {
        provide: FileManagementService,
        useValue: {
          readFromFile: jest.fn(),
          saveToFile: jest.fn(),
          deleteFile: jest.fn(),
        },
      },
      {
        provide: RateService,
        useValue: {
          getAssetRates: jest.fn(),
        },
      },
      {
        provide: WalletSystemLogger,
        useValue: {
          log: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        },
      },
    ],
  }).compile();

  const walletService = module.get<WalletService>(WalletService);
  const fileManagementService = module.get<FileManagementService>(FileManagementService);
  const rateService = module.get<RateService>(RateService);
  const logger = module.get<WalletSystemLogger>(WalletSystemLogger);

  return {
    module,
    walletService,
    fileManagementService,
    rateService,
    logger,
  };
}
