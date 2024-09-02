// import { Controller, Post, Delete, Param, Headers, Body, HttpCode, HttpStatus } from '@nestjs/common';
// import { AssetService } from '../services/wallet-asset-service.service';
// import { AddAssetDto } from '../dtos/requests/add-asset-request.dto';
// import { RemoveAssetDto } from '../dtos/requests/remove-asset-request.dto';
// import { Wallet } from '../models/wallet.model';

// @Controller('assets')
// export class AssetServiceController {
//   constructor(private readonly assetService: AssetService) {}

//   @Post(':walletId')
//   @HttpCode(HttpStatus.OK)
//   async addAsset(
//     @Headers('X-User-ID') userId: string,
//     @Param('walletId') walletId: string,
//     @Body() addAssetDto: AddAssetDto
//   ): Promise<Wallet> {
//     return this.assetService.addAsset(userId, walletId, addAssetDto);
//   }

//   @Delete(':walletId')
//   @HttpCode(HttpStatus.OK)
//   async removeAsset(
//     @Headers('X-User-ID') userId: string,
//     @Param('walletId') walletId: string,
//     @Body() removeAssetDto: RemoveAssetDto
//   ): Promise<Wallet> {
//     return this.assetService.removeAsset(userId, walletId, removeAssetDto);
//   }
// }
