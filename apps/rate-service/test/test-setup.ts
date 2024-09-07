import { Test, TestingModule } from '@nestjs/testing';
import { RateCacheService } from '../src/rates/services/rate-cache.service';
import { RateApiService } from '../src/rates/services/rate-api.service';
import { RateRefreshService } from '../src/rates/services/rate-refresh.service';
import { RateService } from '../src/rates/services/rate-service.service';

export async function createTestModule() {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: RateCacheService,
        useValue: {
          getRate: jest.fn(),
          setRate: jest.fn(),
          getAllRates: jest.fn(),
        },
      },
      {
        provide: RateApiService,
        useValue: {
          fetchRates: jest.fn(),
        },
      },
      RateService,
      RateRefreshService,
    ],
  }).compile();

  const rateCacheService = module.get<RateCacheService>(RateCacheService);
  const rateApiService = module.get<RateApiService>(RateApiService);
  const rateService = module.get<RateService>(RateService);
  const rateRefreshService = module.get<RateRefreshService>(RateRefreshService);

  return {
    rateCacheService,
    rateApiService,
    rateService,
    rateRefreshService,
  };
}
