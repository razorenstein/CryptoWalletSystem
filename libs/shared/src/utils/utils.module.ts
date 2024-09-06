import { Module } from '@nestjs/common';
import { IsAssetIdSupportedConstraint, UserIdValidationMiddleware } from './validation';

@Module({
  providers: [
    UserIdValidationMiddleware, 
    IsAssetIdSupportedConstraint

  ],
  exports: [
    UserIdValidationMiddleware,
    IsAssetIdSupportedConstraint
  ],
})
export class UtilsModule {}