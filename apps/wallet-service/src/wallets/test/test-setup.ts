import { TestingModule, Test } from '@nestjs/testing';
import { FileManagementService } from '@shared/file-management';
import { WalletSystemLogger } from '@shared/logging';
import { WalletService } from '../wallet-service.service';
import { RateService } from '../rate-service-api.service';

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
  const fileManagementService = module.get<FileManagementService>(
    FileManagementService,
  );
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
