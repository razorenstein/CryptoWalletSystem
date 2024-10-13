import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InvalidUserIdException } from '@shared/exceptions';

@Injectable()
export class UserIdValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers['x-user-id'];

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new InvalidUserIdException();
    }

    next();
  }
}
