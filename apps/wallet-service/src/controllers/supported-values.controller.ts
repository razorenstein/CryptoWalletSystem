import { Controller, Get, Version } from '@nestjs/common';
import { SupportedValuesService } from '../services/supported-values.service';

@Controller('api/supported-values')
export class SupportedValuesController {
  constructor(private readonly supportedValuesService: SupportedValuesService) {}

  @Get('currencies')
  @Version('1')
  getSupportedCurrencies(): string[] {
    return this.supportedValuesService.getSupportedCurrencies();
  }

  @Get('asset-ids')
  @Version('1')
  getSupportedAssetIds(): string[] {
    return this.supportedValuesService.getSupportedAssetIds();
  }
}
