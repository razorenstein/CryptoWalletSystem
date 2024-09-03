import { Controller, Get } from '@nestjs/common';
import { SupportedValuesService } from '../services/supported-values.service';

@Controller('supported-values')
export class SupportedValuesController {
  constructor(private readonly supportedValuesService: SupportedValuesService) {}

  @Get('currencies')
  getSupportedCurrencies(): string[] {
    return this.supportedValuesService.getSupportedCurrencies();
  }

  @Get('asset-ids')
  getSupportedAssetIds(): string[] {
    return this.supportedValuesService.getSupportedAssetIds();
  }
}
