import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { validateAssetId } from '../validation.utils';

@ValidatorConstraint({ async: false })
export class IsAssetIdSupportedConstraint
  implements ValidatorConstraintInterface
{
  validate(assetId: any) {
    validateAssetId(assetId);
    return true;
  }

  defaultMessage() {
    return `Asset ID $value is not supported.`;
  }
}

export function IsAssetIdSupported(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAssetIdSupportedConstraint,
    });
  };
}
