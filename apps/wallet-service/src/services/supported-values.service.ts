import { Injectable } from '@nestjs/common';
import { SUPPORTED_CURRENCIES, SUPPORTED_ASSET_IDS } from '@shared/utils';

@Injectable()
export class SupportedValuesService {
  getSupportedCurrencies(): string[] {
    return SUPPORTED_CURRENCIES;
  }

  getSupportedAssetIds(): string[] {
    return SUPPORTED_ASSET_IDS;
  }
}
