import { mockWallet } from '../mocks/mock-data';
import { createTestModule } from '../test-setup';

describe('UserAssetsService', () => {
  let userAssetsService;
  let walletService;
  let userWalletsFileManagementService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const setup = await createTestModule();
    userAssetsService = setup.userAssetsService;
    userWalletsFileManagementService = setup.userWalletsFileManagementService;
    walletService = setup.walletService;
  });

  describe('calculateTotalUserAssetsValue', () => {
    it('should calculate total value of user assets across all wallets', async () => {
      userWalletsFileManagementService.getUserWalletIds.mockResolvedValue([
        'wallet1',
      ]);
      walletService.calculateTotalValue = jest.fn().mockResolvedValue({
        wallet: mockWallet,
        totalValue: 64000, // Total of 2 BTC @ $30,000 and 5 ETH @ $2,000
        currency: 'USD',
      });

      const result = await userAssetsService.calculateTotalUserAssetsValue(
        'user1',
        'USD',
      );
      expect(result.totalValue).toBe(64000);
      expect(result.wallets.length).toBe(1);
      expect(walletService.calculateTotalValue).toHaveBeenCalledWith(
        'user1',
        'wallet1',
        'USD',
      );
    });
  });
});
