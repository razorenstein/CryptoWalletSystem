import { HttpException, BadRequestException, HttpStatus } from '@nestjs/common';

export class AssetNotFoundException extends HttpException {
  constructor(assetId: string, walletId: string) {
    super(`Asset with symbol:${assetId} not found in wallet ${walletId}`, HttpStatus.BAD_REQUEST);
  }
}

export class InsufficientAssetAmountException extends BadRequestException {
  constructor(assetId: string, availableAmount: number, requestedAmount: number) {
    super(`Insufficient amount for asset ${assetId}. Available: ${availableAmount}, Requested: ${requestedAmount}`);
  }
}