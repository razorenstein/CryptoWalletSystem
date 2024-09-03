import { Module } from '@nestjs/common';
import { RateService } from './services/rate-service.service';
import { RateRefreshService } from './services/rate-refresh.service';
import { RateCacheService } from './services/rate-cache.service';
import { RateApiService } from './services/rate-api.service';
import { RateController } from './controllers/rate-service.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggingModule } from '@shared/logging';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule, 
    LoggingModule,
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
