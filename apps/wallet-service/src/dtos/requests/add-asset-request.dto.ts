import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddAssetDto {
  @IsString()
  @IsNotEmpty()
  readonly assetId: string;

  @IsNumber()
  @Min(0.01)
  readonly quantity: number;
}
