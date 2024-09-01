import { Module } from '@nestjs/common';
import { RateService } from './services/rate-service.service';
import { RateRefreshService } from './services/rate-refresh.service';
import { RateCacheService } from './services/rate-cache.service';
import { RateApiService } from './services/rate-api.service';
import { RateController } from './controllers/rate-service.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule, 
    ScheduleModule.forRoot(), 
  ],
  providers: [
    RateService,          
    RateRefreshService,   
    RateCacheService,   
    RateApiService,       
  ],
  controllers: [RateController], 
})
export class RateModule {}
