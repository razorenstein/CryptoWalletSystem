import { RateApiService } from 'apps/rate-service/src/services/rate-api.service';
import { mockCachedRates, mockFetchedRates } from '../mocks/mock-rates';
import { RateCacheService } from 'apps/rate-service/src/services/rate-cache.service';
import { createTestModule } from '../test-setup';

describe('RateRefreshService', () => {
  let rateRefreshService;
  let rateCacheService;
  let rateApiService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Set up the test module and retrieve the services
    const setup = await createTestModule();
    rateRefreshService = setup.rateRefreshService;
    rateCacheService = setup.rateCacheService as jest.Mocked<RateCacheService>;
    rateApiService = setup.rateApiService as jest.Mocked<RateApiService>;

    // Mock the methods with desired return values
    rateCacheService.getRate.mockReturnValue(mockCachedRates[0]);
    rateCacheService.setRate.mockReturnValue(undefined);
    rateCacheService.getAllRates.mockReturnValue(mockCachedRates);

    rateApiService.fetchRates.mockResolvedValue(mockFetchedRates);
  });

  it('should not update cache if there are no cached rates', async () => {
    // Mock the return values
    (rateCacheService.getAllRates as jest.Mock).mockReturnValue([]);

    await rateRefreshService.refreshRates();

    expect(rateCacheService.getAllRates).toHaveBeenCalled();
    expect(rateApiService.fetchRates).not.toHaveBeenCalled();
    expect(rateCacheService.setRate).not.toHaveBeenCalled();
  });
});
