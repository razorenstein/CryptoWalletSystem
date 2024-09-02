import { HttpException, HttpStatus } from '@nestjs/common';

export class AssetNotFoundException extends HttpException {
  constructor(assetId: string, walletId: string) {
    super(`Asset with ID ${assetId} not found in wallet ${walletId}`, HttpStatus.BAD_REQUEST);
  }
}
