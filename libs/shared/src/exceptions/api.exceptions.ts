import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiCallFailedException extends HttpException {
  constructor(serviceName: string, endpoint: string, errorDetails: string) {
    super(
      `API call to ${serviceName} failed at endpoint ${endpoint}. Error: ${errorDetails}`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
