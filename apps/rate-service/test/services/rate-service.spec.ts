import { RateApiService } from '../../src/services/rate-api.service';
import { RateCacheService } from '../../src/services/rate-cache.service';
import { mockCachedRates, mockFetchedRates } from '../mocks/mock-rates';
import { createTestModule } from '../test-setup';

describe('RateService', () => {
  let rateService;
  let rateCacheService;
  let rateApiService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Set up the test module and retrieve the services
    const setup = await createTestModule();
    rateService = setup.rateService;
    rateCacheService = setup.rateCacheService as jest.Mocked<RateCacheService>;
    rateApiService = setup.rateApiService as jest.Mocked<RateApiService>;

    // Mock the methods with desired return values
    rateCacheService.getRate.mockReturnValue(mockCachedRates[0]);
    rateApiService.fetchRates.mockResolvedValue(mockFetchedRates);
    rateCacheService.setRate.mockReturnValue(undefined);
    rateCacheService.getAllRates.mockReturnValue(mockCachedRates);
  });

  it('should return rates from the cache if they exist', async () => {
    const assetIds = ['bitcoin', 'ethereum'];
    const currency = 'USD';

    // Simulate rates being available in cache
    (rateCacheService.getRate as jest.Mock).mockImplementation(
      (assetId, currency) => {
        return mockCachedRates.find(
          (rate) => rate.assetId === assetId && rate.currency === currency,
        );
      },
    );

    const rates = await rateService.getRates(assetIds, currency);

    expect(rateCacheService.getRate).toHaveBeenCalledTimes(assetIds.length);
    expect(rateApiService.fetchRates).not.toHaveBeenCalled(); // No need to fetch from API since they are cached
    expect(rates).toEqual(mockCachedRates); // Ensure returned rates are from the cache
  });

  it('should fetch rates from the API if not found in cache', async () => {
    const assetIds = ['bitcoin', 'ethereum'];
    const currency = 'USD';

    // Simulate cache miss for all assetIds
    (rateCacheService.getRate as jest.Mock).mockReturnValue(null);
    (rateApiService.fetchRates as jest.Mock).mockResolvedValue(
      mockFetchedRates,
    );

    const rates = await rateService.getRates(assetIds, currency);

    expect(rateCacheService.getRate).toHaveBeenCalledTimes(assetIds.length);
    expect(rateApiService.fetchRates).toHaveBeenCalledWith(assetIds, [
      currency,
    ]); // Ensure we fetch the rates from API
    expect(rates).toEqual(mockFetchedRates);

    // Ensure that fetched rates are set into the cache
    mockFetchedRates.forEach((rate) => {
      expect(rateCacheService.setRate).toHaveBeenCalledWith(rate);
    });
  });

  it('should return a mix of cached and fetched rates', async () => {
    const assetIds = ['bitcoin', 'ethereum'];
    const currency = 'USD';

    // Mock the cache to return the cached rates for both assets
    rateCacheService.getRate.mockImplementation(
      (assetId: string, currency: string) => {
        return mockCachedRates.find(
          (rate) => rate.assetId === assetId && rate.currency === currency,
        );
      },
    );

    // Mock the API to return fetched rates (but this should not be called since all are cached)
    rateApiService.fetchRates.mockResolvedValue(mockFetchedRates);

    const rates = await rateService.getRates(assetIds, currency);

    // Check that getRate was called twice (once per asset)
    expect(rateCacheService.getRate).toHaveBeenCalledTimes(assetIds.length);

    // Ensure fetchRates was not called because all rates are cached
    expect(rateApiService.fetchRates).not.toHaveBeenCalled();

    // Verify that the returned rates are the cached rates
    expect(rates).toEqual([
      ...mockCachedRates, // Return the cached rates only
    ]);
  });
});
