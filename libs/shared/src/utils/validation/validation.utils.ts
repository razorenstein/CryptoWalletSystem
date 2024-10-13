// libs/shared/src/utils/validation.utils.ts

import {
  UnsupportedAssetIdException,
  UnsupportedCurrencyException,
} from '@shared/exceptions';
import {
  SUPPORTED_CURRENCIES,
  SUPPORTED_ASSET_IDS,
} from '../supported-values.constants';

export function validateCurrency(currency: string): void {
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw new UnsupportedCurrencyException(currency);
  }
}

export function validateAssetId(assetId: string): void {
  if (!SUPPORTED_ASSET_IDS.includes(assetId)) {
    throw new UnsupportedAssetIdException(assetId);
  }
}
