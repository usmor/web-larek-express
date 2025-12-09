import { CelebrateError } from 'celebrate';
import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import InternalServerError from '../errors/internal-server-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';

const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = 'Внутренняя ошибка сервера';

  if (err instanceof CelebrateError) {
    statusCode = 400;
    message = 'Ошибка валидации данных';

    const details = err.details.get('body') || err.details.get('params') || err.details.get('query');

    if (details && details.details.length > 0) {
      const firstError = details.details[0];
      if (firstError.message) {
        message = firstError.message;
      }
    }

    return res.status(statusCode).json({ message });
  }

  if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    const firstError = Object.values(err.errors)[0];
    message = firstError?.message || 'Ошибка валидации данных';

    return res.status(statusCode).json({ message });
  }

  if (err instanceof BadRequestError
      || err instanceof ConflictError
      || err instanceof InternalServerError
      || err instanceof UnauthorizedError
      || err instanceof NotFoundError) {
    statusCode = err.statusCode;
    message = err.message;

    return res.status(statusCode).json({ message });
  }

  if (err instanceof Error && 'statusCode' in err) {
    statusCode = (err as any).statusCode;
    message = err.message;

    return res.status(statusCode).json({ message });
  }

  res.status(statusCode).json({ message });
};

export default errorHandler;
