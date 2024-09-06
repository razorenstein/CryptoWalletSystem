import { WalletNotFoundException, UnauthorizedWalletAccessException, MaxWalletsExceededException, InsufficientAssetAmountException, AssetNotFoundException } from '@shared/exceptions';
import { mockRatesResponse, mockWallet } from '../mocks/mock-data';
import { createTestModule } from '../test-setup';
import config from '../../src/config/config';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('WalletService', () => {
    let walletService;
    let walletFileManagementService;
    let userWalletsFileManagementService;
    let rateService;
  
    beforeEach(async () => {
        jest.clearAllMocks();

        const setup = await createTestModule();
        walletService = setup.walletService;
        walletFileManagementService = setup.walletFileManagementService;
        userWalletsFileManagementService = setup.userWalletsFileManagementService;
        rateService = setup.rateService;

        // Set mock configuration values
        config.wallet.maxWalletsPerUser = 1; 
    });

    describe('createWallet', () => {
      it('should create a new wallet with a generated UUID if the user does not exceed the limit', async () => {
          userWalletsFileManagementService.getUserWalletIds = jest.fn().mockResolvedValue([]); // No wallets yet
          walletFileManagementService.getWallet = jest.fn().mockResolvedValue(null); // Wallet doesn't exist
          walletFileManagementService.saveWallet = jest.fn().mockResolvedValue(undefined);
          userWalletsFileManagementService.addUserWallet = jest.fn().mockResolvedValue(undefined);
          
          const mockUUID = 'generated-uuid';
          uuidv4.mockReturnValue(mockUUID);  // Mock UUID generation

          const result = await walletService.createWallet('user1');

          expect(walletFileManagementService.saveWallet).toHaveBeenCalledWith({
              id: mockUUID, 
              userId: 'user1',
              cryptoAssets: [],
              lastUpdated: expect.any(Date),
          });

          expect(userWalletsFileManagementService.addUserWallet).toHaveBeenCalledWith('user1', mockUUID);
          expect(result).toEqual({
              id: mockUUID,
              userId: 'user1',
              cryptoAssets: [],
              lastUpdated: expect.any(Date),
          });
      });

      it('should throw MaxWalletsExceededException if user exceeds the max wallets', async () => {
          userWalletsFileManagementService.getUserWalletIds = jest.fn().mockResolvedValue(['wallet1']); // Already 1 wallet

          await expect(walletService.createWallet('user1')).rejects.toThrow(MaxWalletsExceededException);
          expect(walletFileManagementService.saveWallet).not.toHaveBeenCalled();
      });
  });

  describe('getWallet', () => {
    it('should retrieve wallet if user owns the wallet', async () => {
      userWalletsFileManagementService.getUserWalletIds = jest.fn().mockResolvedValue(['wallet1']);
      walletFileManagementService.getWallet = jest.fn().mockResolvedValue(mockWallet);

      const result = await walletService.getWallet('user1', 'wallet1');

      expect(walletFileManagementService.getWallet).toHaveBeenCalledWith('wallet1');
      expect(result).toEqual(mockWallet);
    });

    it('should throw WalletNotFoundException if wallet does not exist', async () => {
      userWalletsFileManagementService.getUserWalletIds = jest.fn().mockResolvedValue(['wallet1']);
      walletFileManagementService.getWallet = jest.fn().mockResolvedValue(null);

      await expect(walletService.getWallet('user1', 'wallet1')).rejects.toThrow(WalletNotFoundException);
    });

    it('should throw UnauthorizedWalletAccessException if user does not own the wallet', async () => {
      userWalletsFileManagementService.getUserWalletIds = jest.fn().mockResolvedValue(['wallet2']);
      walletFileManagementService.getWallet = jest.fn().mockResolvedValue(mockWallet);

      await expect(walletService.getWallet('user1', 'wallet1')).rejects.toThrow(UnauthorizedWalletAccessException);
    });
  });

  describe('deleteWallet', () => {
    it('should delete a wallet if the user owns it', async () => {
      userWalletsFileManagementService.getUserWalletIds = jest.fn().mockResolvedValue(['wallet1']);
      walletFileManagementService.getWallet = jest.fn().mockResolvedValue(mockWallet);
      walletFileManagementService.deleteWallet = jest.fn().mockResolvedValue(undefined);
      userWalletsFileManagementService.removeUserWallet = jest.fn().mockResolvedValue(undefined);

      await walletService.deleteWallet('user1', 'wallet1');

      expect(walletFileManagementService.deleteWallet).toHaveBeenCalledWith('user1', 'wallet1');
      expect(userWalletsFileManagementService.removeUserWallet).toHaveBeenCalledWith('user1', 'wallet1');
    });
  });

  describe('calculateTotalValue', () => {
    it('should calculate the total value of the wallet in USD', async () => {
      userWalletsFileManagementService.getUserWalletIds = jest.fn().mockResolvedValue(['wallet1']);
      walletFileManagementService.getWallet = jest.fn().mockResolvedValue(mockWallet);
      rateService.getAssetRates = jest.fn().mockResolvedValue(mockRatesResponse);

      const result = await walletService.calculateTotalValue('user1', 'wallet1', 'USD');

      expect(result.totalValue).toBe(70000); // 60,000 (bitcoin) + 10,000 (ethereum)
      expect(result.wallet).toEqual(mockWallet);
      expect(result.currency).toBe('USD');
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
      walletService.addAsset = addAssetSpy;
      walletService.removeAsset = removeAssetSpy;
  
      await walletService.rebalance('user1', 'wallet1', { bitcoin: 70, ethereum: 30 });
  
      // Expected target amounts:
      const expectedEthereumAddAmount = 10.5 - 5; 
      const expectedBitcoinRemoveAmount = 0.3666666666666667;
  
      // Check if the addAsset and removeAsset functions are called correctly
      expect(addAssetSpy).toHaveBeenCalledWith('user1', 'wallet1', { assetId: 'ethereum', amount: expectedEthereumAddAmount });
      expect(removeAssetSpy).toHaveBeenCalledWith('user1', 'wallet1', { assetId: 'bitcoin', amount: expectedBitcoinRemoveAmount });
    });
  });

  describe('addAsset', () => {
    it('should add a new asset to the wallet', async () => {
      const newAssetDto = { assetId: 'litecoin', amount: 10 };
      walletFileManagementService.getWallet.mockResolvedValue(mockWallet);

      const result = await walletService.addAsset('user1', 'wallet1', newAssetDto);

      expect(result.cryptoAssets).toContainEqual({ id: 'litecoin', amount: 10 });
      expect(walletFileManagementService.saveWallet).toHaveBeenCalled();
    });

    it('should update an existing asset in the wallet', async () => {
      const existingAssetDto = { assetId: 'bitcoin', amount: 3 };
      walletFileManagementService.getWallet.mockResolvedValue(mockWallet);

      const result = await walletService.addAsset('user1', 'wallet1', existingAssetDto);

      const bitcoin = result.cryptoAssets.find(asset => asset.id === 'bitcoin');
      expect(bitcoin.amount).toBe(5); // 2 (existing) + 3 (added)
      expect(walletFileManagementService.saveWallet).toHaveBeenCalled();
    });

    it('should throw WalletNotFoundException if wallet is not found', async () => {
      walletFileManagementService.getWallet.mockResolvedValue(null);

      await expect(
        walletService.addAsset('user1', 'walletNotExist', { assetId: 'bitcoin', amount: 1 }),
      ).rejects.toThrow(WalletNotFoundException);
    });
  });

  describe('removeAsset', () => {
    it('should remove an asset from the wallet when the amount is reduced to zero', async () => {
        const removeAssetDto = { assetId: 'bitcoin', amount: 2 }; // Adjusted to the exact amount to remove
      
        walletFileManagementService.getWallet.mockResolvedValue(mockWallet);
      
        const result = await walletService.removeAsset('user1', 'wallet1', removeAssetDto);
      
        // Asset 'bitcoin' should no longer exist
        expect(result.cryptoAssets.length).toBe(3);
      
        expect(walletFileManagementService.saveWallet).toHaveBeenCalled();
    });

    it('should decrease asset amount if partially removed', async () => {
      const removeAssetDto = { assetId: 'ethereum', amount: 2 };
      walletFileManagementService.getWallet.mockResolvedValue(mockWallet);

      const result = await walletService.removeAsset('user1', 'wallet1', removeAssetDto);

      const ethereum = result.cryptoAssets.find(asset => asset.id === 'ethereum');
      expect(ethereum.amount).toBe(3); // 5 (existing) - 2 (removed)
      expect(walletFileManagementService.saveWallet).toHaveBeenCalled();
    });

    it('should throw InsufficientAssetAmountException when trying to remove more than available', async () => {
        const removeAssetDto = { assetId: 'ethereum', amount: 6 }; // Try to remove more than available (5 in the mock data)
        
        // Mock wallet to have insufficient amount
        walletFileManagementService.getWallet.mockResolvedValue(mockWallet);
      
        await expect(walletService.removeAsset('user1', 'wallet1', removeAssetDto))
          .rejects
          .toThrow(InsufficientAssetAmountException);
      });

    it('should throw AssetNotFoundException if asset is not found', async () => {
      walletFileManagementService.getWallet.mockResolvedValue(mockWallet);

      await expect(
        walletService.removeAsset('user1', 'wallet1', { assetId: 'dogecoin', amount: 1 }),
      ).rejects.toThrow(AssetNotFoundException);
    });
  });
});
