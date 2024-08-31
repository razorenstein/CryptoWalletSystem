
import { IsString, IsNotEmpty } from 'class-validator';

export class AddWalletRequestDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  walletId: string;
}
