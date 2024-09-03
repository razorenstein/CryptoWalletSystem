import { HttpException, HttpStatus } from '@nestjs/common';

export class WalletAlreadyExistsException extends HttpException {
  constructor(walletId: string, userId: string) {
    super(`Wallet with ID ${walletId} already exists`, HttpStatus.CONFLICT);
  }
}

export class WalletNotFoundException extends HttpException {
  constructor(walletId: string, userId: string) {
    super(`Wallet with ID ${walletId} not found for user ${userId}`, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedWalletAccessException extends HttpException {
    constructor(walletId: string, userId: string) {
      super(`User ${userId} is not authorized to access wallet ${walletId}`, HttpStatus.FORBIDDEN);
    }
}

export class UnsupportedCurrencyException extends HttpException {
  constructor(currency: string) {
    super(`Currency "${currency}" is not supported.`, HttpStatus.BAD_REQUEST);
  }
}