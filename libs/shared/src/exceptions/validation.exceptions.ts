import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidUserIdException extends HttpException {
  constructor() {
    super('Invalid or missing X-User-ID header', HttpStatus.BAD_REQUEST);
  }
}
