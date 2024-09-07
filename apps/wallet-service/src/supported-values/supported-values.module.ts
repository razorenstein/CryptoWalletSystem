import { Module } from '@nestjs/common';
import { SupportedValuesService } from './supported-values.service';
import { SupportedValuesController } from './supported-values.controller';

@Module({
  controllers: [SupportedValuesController],
  providers: [SupportedValuesService],
})

export class SupportedValuesModule {}
