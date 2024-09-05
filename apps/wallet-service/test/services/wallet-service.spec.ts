import { WalletAlreadyExistsException, WalletNotFoundException, UnauthorizedWalletAccessException, MaxWalletsExceededException } from '@shared/exceptions';
import { mockRatesResponse, mockWallet } from '../mocks/mock-data';
import { createTestModule } from '../test-setup';
import config from '../../src/config/config';
  
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
    it('should create a new wallet if the user does not exceed the limit', async () => {
        userWalletsFileManagementService.getUserWalletIds = jest.fn().mockResolvedValue([]); // No wallets yet
        walletFileManagementService.getWallet = jest.fn().mockResolvedValue(null); // Wallet doesn't exist
        walletFileManagementService.saveWallet = jest.fn().mockResolvedValue(undefined);
        userWalletsFileManagementService.addUserWallet = jest.fn().mockResolvedValue(undefined);

        const result = await walletService.createWallet('user1', 'wallet2');

        expect(walletFileManagementService.saveWallet).toHaveBeenCalledWith({
        id: 'wallet2',
        userId: 'user1',
        cryptoAssets: [],
        lastUpdated: expect.any(Date),
        });

        expect(userWalletsFileManagementService.addUserWallet).toHaveBeenCalledWith('user1', 'wallet2');
        expect(result).toEqual({
        id: 'wallet2',
        userId: 'user1',
        cryptoAssets: [],
        lastUpdated: expect.any(Date),
        });
    });
  
    it('should throw MaxWalletsExceededException if user exceeds the max wallets', async () => {
      userWalletsFileManagementService.getUserWalletIds = jest.fn().mockResolvedValue(['wallet1']); // Already 1 wallet
  
      await expect(walletService.createWallet('user1', 'wallet3')).rejects.toThrow(MaxWalletsExceededException);
      expect(walletFileManagementService.saveWallet).not.toHaveBeenCalled();
    });
  
    it('should throw WalletAlreadyExistsException if wallet already exists', async () => {
      userWalletsFileManagementService.getUserWalletIds = jest.fn().mockResolvedValue([]); // No wallets yet
      walletFileManagementService.getWallet = jest.fn().mockResolvedValue(mockWallet); // Wallet exists
  
      await expect(walletService.createWallet('user1', 'wallet1')).rejects.toThrow(WalletAlreadyExistsException);
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
});
