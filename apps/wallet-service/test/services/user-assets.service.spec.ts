import { mockRatesResponse, mockWallet } from '../mocks/mock-data';
import { createTestModule } from '../test-setup';

describe('UserAssetsService', () => {
  let userAssetsService;
  let walletService;
  let walletAssetService;
  let rateService;
  let walletFileManagementService;
  let userWalletsFileManagementService;

  beforeEach(async () => {
    jest.clearAllMocks();
  
    const setup = await createTestModule();
    userAssetsService = setup.userAssetsService;
    walletService = setup.walletService;
    walletAssetService = setup.walletAssetService;
    rateService = setup.rateService;
    walletFileManagementService = setup.walletFileManagementService;
    userWalletsFileManagementService = setup.userWalletsFileManagementService;
  });

  describe('calculateTotalUserAssetsValue', () => {
    it('should calculate total value of user assets across all wallets', async () => {
      userWalletsFileManagementService.getUserWalletIds.mockResolvedValue(['wallet1']); 
      walletService.calculateTotalValue = jest.fn().mockResolvedValue({
        wallet: mockWallet,
        totalValue: 64000, // Total of 2 BTC @ $30,000 and 5 ETH @ $2,000
        currency: 'USD',
      });
  
      const result = await userAssetsService.calculateTotalUserAssetsValue('user1', 'USD');
      expect(result.totalValue).toBe(64000);
      expect(result.wallets.length).toBe(1);
      expect(walletService.calculateTotalValue).toHaveBeenCalledWith('user1', 'wallet1', 'USD');
    });
  });

  describe('rebalance', () => {
    it('should rebalance wallet assets based on target percentages (70% bitcoin, 30% ethereum)', async () => {
      const totalValue = 70000; // Total value is 60,000 (bitcoin) + 10,000 (ethereum)
      
      // Ensure the wallet is retrieved correctly
      walletFileManagementService.getWallet.mockResolvedValue(mockWallet);
  
      // Mock calculateTotalValue
      walletService.calculateTotalValue = jest.fn().mockResolvedValue({
        wallet: mockWallet,
        totalValue,
        currency: 'USD',
      });
  
      // Mock getAssetRates
      rateService.getAssetRates.mockResolvedValue(mockRatesResponse);
  
      // Perform rebalance
      const addAssetSpy = jest.fn();
      const removeAssetSpy = jest.fn();
      walletAssetService.addAsset = addAssetSpy;
      walletAssetService.removeAsset = removeAssetSpy;
  
      await userAssetsService.rebalance('user1', 'wallet1', { bitcoin: 70, ethereum: 30 });
  
      // Expected target amounts:
      const expectedEthereumAddAmount = 10.5 - 5; 
      const expectedBitcoinRemoveAmount = 0.3666666666666667;
  
      // Check if the addAsset and removeAsset functions are called correctly
      expect(addAssetSpy).toHaveBeenCalledWith('user1', 'wallet1', { assetId: 'ethereum', amount: expectedEthereumAddAmount });
      expect(removeAssetSpy).toHaveBeenCalledWith('user1', 'wallet1', { assetId: 'bitcoin', amount: expectedBitcoinRemoveAmount });
    });
  });
});
