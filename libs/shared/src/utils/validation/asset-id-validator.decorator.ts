import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { validateAssetId } from '@shared/utils';
import { UnsupportedAssetIdException } from '@shared/exceptions';

@ValidatorConstraint({ async: false })
export class IsAssetIdSupportedConstraint implements ValidatorConstraintInterface {
    validate(assetId: any, args: ValidationArguments) {
        validateAssetId(assetId);
        return true;
    }
  
    defaultMessage(args: ValidationArguments) {
      return `Asset ID $value is not supported.`;
    }
  }

export function IsAssetIdSupported(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAssetIdSupportedConstraint,
    });
  };
}
