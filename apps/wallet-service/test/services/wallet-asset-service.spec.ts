import { AssetNotFoundException, WalletNotFoundException, InsufficientAssetAmountException } from '@shared/exceptions';
import { mockWallet } from '../mocks/mock-data';
import { createTestModule } from '../test-setup';

describe('WalletAssetService', () => {
  let walletAssetService;
  let walletFileManagementService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const setup = await createTestModule();
    walletAssetService = setup.walletAssetService;
    walletFileManagementService = setup.walletFileManagementService;
  });

  describe('addAsset', () => {
    it('should add a new asset to the wallet', async () => {
      const newAssetDto = { assetId: 'litecoin', amount: 10 };
      walletFileManagementService.getWallet.mockResolvedValue(mockWallet);

      const result = await walletAssetService.addAsset('user1', 'wallet1', newAssetDto);

      expect(result.cryptoAssets).toContainEqual({ id: 'litecoin', amount: 10 });
      expect(walletFileManagementService.saveWallet).toHaveBeenCalled();
    });

    it('should update an existing asset in the wallet', async () => {
      const existingAssetDto = { assetId: 'bitcoin', amount: 3 };
      walletFileManagementService.getWallet.mockResolvedValue(mockWallet);

      const result = await walletAssetService.addAsset('user1', 'wallet1', existingAssetDto);

      const bitcoin = result.cryptoAssets.find(asset => asset.id === 'bitcoin');
      expect(bitcoin.amount).toBe(5); // 2 (existing) + 3 (added)
      expect(walletFileManagementService.saveWallet).toHaveBeenCalled();
    });

    it('should throw WalletNotFoundException if wallet is not found', async () => {
      walletFileManagementService.getWallet.mockResolvedValue(null);

      await expect(
        walletAssetService.addAsset('user1', 'walletNotExist', { assetId: 'bitcoin', amount: 1 }),
      ).rejects.toThrow(WalletNotFoundException);
    });
  });

  describe('removeAsset', () => {
    it('should remove an asset from the wallet when the amount is reduced to zero', async () => {
        const removeAssetDto = { assetId: 'bitcoin', amount: 2 }; // Adjusted to the exact amount to remove
      
        walletFileManagementService.getWallet.mockResolvedValue(mockWallet);
      
        const result = await walletAssetService.removeAsset('user1', 'wallet1', removeAssetDto);
      
        // Asset 'bitcoin' should no longer exist
        expect(result.cryptoAssets.length).toBe(3);
      
        expect(walletFileManagementService.saveWallet).toHaveBeenCalled();
    });

    it('should decrease asset amount if partially removed', async () => {
      const removeAssetDto = { assetId: 'ethereum', amount: 2 };
      walletFileManagementService.getWallet.mockResolvedValue(mockWallet);

      const result = await walletAssetService.removeAsset('user1', 'wallet1', removeAssetDto);

      const ethereum = result.cryptoAssets.find(asset => asset.id === 'ethereum');
      expect(ethereum.amount).toBe(3); // 5 (existing) - 2 (removed)
      expect(walletFileManagementService.saveWallet).toHaveBeenCalled();
    });

    it('should throw InsufficientAssetAmountException when trying to remove more than available', async () => {
        const removeAssetDto = { assetId: 'ethereum', amount: 6 }; // Try to remove more than available (5 in the mock data)
        
        // Mock wallet to have insufficient amount
        walletFileManagementService.getWallet.mockResolvedValue(mockWallet);
      
        await expect(walletAssetService.removeAsset('user1', 'wallet1', removeAssetDto))
          .rejects
          .toThrow(InsufficientAssetAmountException);
      });

    it('should throw AssetNotFoundException if asset is not found', async () => {
      walletFileManagementService.getWallet.mockResolvedValue(mockWallet);

      await expect(
        walletAssetService.removeAsset('user1', 'wallet1', { assetId: 'dogecoin', amount: 1 }),
      ).rejects.toThrow(AssetNotFoundException);
    });
  });
});
