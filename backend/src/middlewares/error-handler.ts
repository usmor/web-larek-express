import { CelebrateError } from 'celebrate';
import { Request, Response, NextFunction } from 'express';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import InternalServerError from '../errors/internal-server-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';

const errorHandler = (
  error: BadRequestError | NotFoundError | ConflictError |
        CelebrateError | UnauthorizedError | InternalServerError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = 'Внутренняя ошибка сервера';

  if (error instanceof CelebrateError) {
    statusCode = 400;
    message = error.details.get('body')?.details[0].message || 'Ошибка валидации данных';
  } else if (
    error instanceof BadRequestError
    || error instanceof ConflictError
    || error instanceof NotFoundError
    || error instanceof UnauthorizedError
    || error instanceof InternalServerError
  ) {
    statusCode = error.statusCode;
    message = error.message;
  }
  return res.status(statusCode).json({ message });
};

export default errorHandler;
