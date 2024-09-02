import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateWalletDto {
  @IsString()
  @IsNotEmpty()
  readonly walletId: string;
}
