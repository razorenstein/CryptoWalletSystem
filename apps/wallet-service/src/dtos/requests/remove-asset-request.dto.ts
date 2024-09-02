import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class RemoveAssetDto {
  @IsString()
  @IsNotEmpty()
  readonly assetId: string;

  @IsNumber()
  @Min(Number.MIN_VALUE, { message: `The value must be greater than or equal to ${Number.MIN_VALUE}` })
  readonly amount: number;
}
