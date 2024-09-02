import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveAssetDto {
  @IsString()
  @IsNotEmpty()
  readonly assetId: string;
}
