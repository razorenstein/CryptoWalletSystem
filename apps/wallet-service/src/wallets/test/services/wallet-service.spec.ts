import {
  WalletNotFoundException,
  UnauthorizedWalletAccessException,
  MaxWalletsExceededException,
} from '@shared/exceptions';
import { v4 as uuidv4 } from 'uuid';
import { mockRatesResponse, mockWallet } from '../mocks/mock-data';
import { createTestModule } from '../test-setup';
import { AddAssetDto } from 'apps/wallet-service/src/wallets/dtos/add-asset-request.dto';
import { RemoveAssetDto } from 'apps/wallet-service/src/wallets/dtos/remove-asset-request.dto';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('WalletService', () => {
  let walletService;
  let fileManagementService;
  let rateService;

  beforeEach(async () => {
    const setup = await createTestModule();

    walletService = setup.walletService;
    fileManagementService = setup.fileManagementService;
    rateService = setup.rateService;
    jest.clearAllMocks();
  });

  describe('createWallet', () => {
    it('should create a new wallet with a generated UUID if the user does not exceed the limit', async () => {
      fileManagementService.readFromFile
        .mockResolvedValueOnce({ user1: [] }) // No wallets yet
        .mockResolvedValueOnce({}); // Empty wallets data
      fileManagementService.saveToFile.mockResolvedValue(undefined);
      const mockUUID = 'generated-uuid';
      uuidv4.mockReturnValue(mockUUID);

      const result = await walletService.createWallet('user1');

      expect(fileManagementService.saveToFile).toHaveBeenCalledWith(
        'wallets',
        expect.objectContaining({
          [mockUUID]: {
            id: mockUUID,
            userId: 'user1',
            cryptoAssets: {}, // Now cryptoAssets is an empty object (map)
            lastUpdated: expect.any(Date),
          },
        }),
      );

      expect(fileManagementService.saveToFile).toHaveBeenCalledWith(
        'users-wallets',
        { user1: [mockUUID] },
      );

      expect(result).toEqual({
        id: mockUUID,
        userId: 'user1',
        cryptoAssets: {},
        lastUpdated: expect.any(Date),
      });
    });

    it('should throw MaxWalletsExceededException if user exceeds the max wallets', async () => {
      fileManagementService.readFromFile.mockResolvedValueOnce({
        user1: ['wallet1'],
      }); // User has one wallet

      await expect(walletService.createWallet('user1')).rejects.toThrow(
        MaxWalletsExceededException,
      );
    });
  });

  describe('getWallet', () => {
    it('should retrieve wallet if user owns the wallet', async () => {
      fileManagementService.readFromFile
        .mockResolvedValueOnce({ user1: ['wallet1'] }) // User owns wallet1
        .mockResolvedValueOnce({ wallet1: mockWallet }); // Wallet data

      const result = await walletService.getWallet('user1', 'wallet1');

      expect(fileManagementService.readFromFile).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockWallet);
    });

    it('should throw WalletNotFoundException if wallet does not exist', async () => {
      fileManagementService.readFromFile
        .mockResolvedValueOnce({ user1: ['wallet1'] }) // User owns wallet1
        .mockResolvedValueOnce({}); // Empty wallets data

      await expect(walletService.getWallet('user1', 'wallet1')).rejects.toThrow(
        WalletNotFoundException,
      );
    });

    it('should throw UnauthorizedWalletAccessException if user does not own the wallet', async () => {
      fileManagementService.readFromFile
        .mockResolvedValueOnce({ user1: ['wallet2'] }) // User owns wallet2, not wallet1
        .mockResolvedValueOnce({ wallet1: mockWallet }); // Wallet data

      await expect(walletService.getWallet('user1', 'wallet1')).rejects.toThrow(
        UnauthorizedWalletAccessException,
      );
    });
  });

  describe('rebalance', () => {
    it('should rebalance wallet assets based on target percentages', async () => {
      const totalValue = 70000; // Total wallet value
      fileManagementService.readFromFile
        .mockResolvedValueOnce({ user1: ['wallet1'] }) // User owns wallet1
        .mockResolvedValueOnce({ wallet1: mockWallet }); // Wallet data
      rateService.getAssetRates.mockResolvedValue(mockRatesResponse);

      walletService.calculateTotalValue = jest.fn().mockResolvedValue({
        wallet: mockWallet,
        totalValue,
        currency: 'USD',
      });

      const addAssetSpy = jest.fn();
      const removeAssetSpy = jest.fn();
      walletService.addAsset = addAssetSpy;
      walletService.removeAsset = removeAssetSpy;

      await walletService.rebalance('user1', 'wallet1', {
        bitcoin: 70,
        ethereum: 30,
      });

      const expectedEthereumAddAmount = 10.5 - 5;
      const expectedBitcoinRemoveAmount = 0.3666666666666667;

      expect(addAssetSpy).toHaveBeenCalledWith('user1', 'wallet1', {
        assetId: 'ethereum',
        amount: expectedEthereumAddAmount,
      });
      expect(removeAssetSpy).toHaveBeenCalledWith('user1', 'wallet1', {
        assetId: 'bitcoin',
        amount: expectedBitcoinRemoveAmount,
      });
    });
  });

  describe('addAsset', () => {
    it('should add a new asset to the wallet', async () => {
      const newAssetDto: AddAssetDto = { assetId: 'litecoin', amount: 10 };

      fileManagementService.readFromFile
        .mockResolvedValueOnce({ user1: ['wallet1'] }) // Ensure user owns the wallet
        .mockResolvedValueOnce({ wallet1: mockWallet }); // Existing wallet data

      const result = await walletService.addAsset(
        'user1',
        'wallet1',
        newAssetDto,
      );

      expect(result.cryptoAssets['litecoin']).toBe(10); // Check that litecoin was added
      expect(fileManagementService.saveToFile).toHaveBeenCalled();
    });

    it('should update an existing asset in the wallet', async () => {
      const existingAssetDto: AddAssetDto = { assetId: 'bitcoin', amount: 3 };

      fileManagementService.readFromFile
        .mockResolvedValueOnce({ user1: ['wallet1'] }) // Ensure user owns the wallet
        .mockResolvedValueOnce({ wallet1: mockWallet }); // Existing wallet data

      const result = await walletService.addAsset(
        'user1',
        'wallet1',
        existingAssetDto,
      );

      expect(result.cryptoAssets['bitcoin']).toBe(5); // 2 (existing) + 3 (added)
      expect(fileManagementService.saveToFile).toHaveBeenCalled();
    });
  });

  describe('removeAsset', () => {
    it('should remove an asset from the wallet when the amount is reduced to zero', async () => {
      const removeAssetDto: RemoveAssetDto = { assetId: 'bitcoin', amount: 5 };

      fileManagementService.readFromFile
        .mockResolvedValueOnce({ user1: ['wallet1'] }) // Ensure user owns the wallet
        .mockResolvedValueOnce({ wallet1: mockWallet }); // Existing wallet data

      const result = await walletService.removeAsset(
        'user1',
        'wallet1',
        removeAssetDto,
      );

      expect(result.cryptoAssets['bitcoin']).toBeUndefined(); // bitcoin should be removed
      expect(fileManagementService.saveToFile).toHaveBeenCalled();
    });

    it('should decrease asset amount if partially removed', async () => {
      const removeAssetDto: RemoveAssetDto = { assetId: 'ethereum', amount: 2 };

      fileManagementService.readFromFile
        .mockResolvedValueOnce({ user1: ['wallet1'] }) // Ensure user owns the wallet
        .mockResolvedValueOnce({ wallet1: mockWallet }); // Existing wallet data

      const result = await walletService.removeAsset(
        'user1',
        'wallet1',
        removeAssetDto,
      );

      expect(result.cryptoAssets['ethereum']).toBe(3); // 5 (existing) - 2 (removed)
      expect(fileManagementService.saveToFile).toHaveBeenCalled();
    });
  });
});
