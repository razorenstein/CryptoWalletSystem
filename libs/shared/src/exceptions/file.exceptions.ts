import { HttpException, HttpStatus } from '@nestjs/common';

export class FileOperationException extends HttpException {
  constructor(operation: string, filePath: string, error: string) {
    super(
      `Failed to ${operation} the file at path "${filePath}". Error: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
