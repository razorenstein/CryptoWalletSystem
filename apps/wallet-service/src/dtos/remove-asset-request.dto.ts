import { IsAssetIdSupported } from '@shared/utils';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class RemoveAssetDto {
  @IsString()
  @IsNotEmpty()
  @IsAssetIdSupported()
  readonly assetId: string;

  @IsNumber()
  @Min(Number.MIN_VALUE, {
    message: `The value must be greater than or equal to ${Number.MIN_VALUE}`,
  })
  readonly amount: number;
}
