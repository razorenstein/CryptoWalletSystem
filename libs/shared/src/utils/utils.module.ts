import { Module } from '@nestjs/common';
import {
  IsAssetIdSupportedConstraint,
  UserIdValidationMiddleware,
} from './validation';
import { HttpUtil } from './http-util';

@Module({
  providers: [UserIdValidationMiddleware, IsAssetIdSupportedConstraint, HttpUtil],
  exports: [UserIdValidationMiddleware, IsAssetIdSupportedConstraint, HttpUtil],
})
export class UtilsModule {}
