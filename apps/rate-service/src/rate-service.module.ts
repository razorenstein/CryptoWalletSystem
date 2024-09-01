import { Module } from '@nestjs/common';
import { RateService } from './rate-service.service';
import { RateRefreshService } from './rate-refresh.service';
import { RateCacheService } from './rate-cache.service';
import { RateApiService } from './rate-api.service';
import { RateController } from './rate-service.controller';
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
