import { IsNotEmpty, Validate } from 'class-validator';
import { IsAssetIdSupported } from '@shared/utils';

export class RebalanceWalletDto {
  @IsNotEmpty()
  @Validate(IsAssetIdSupported, {
    each: true,
  })
  targetPercentages: Record<string, number>;
}
