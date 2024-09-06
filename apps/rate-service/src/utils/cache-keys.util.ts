export function generateRatesCacheKey(
  assetId: string,
  currency: string,
): string {
  return `${assetId.toLowerCase()}-${currency.toLowerCase()}`;
}
