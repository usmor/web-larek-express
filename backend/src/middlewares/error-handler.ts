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
    message = error.details.get('body')?.details[0].message || 'Некорректные данные';
  } else if (error instanceof BadRequestError) {
    statusCode = 400;
    message = error.message;
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
    message = error.message;
  } else if (error instanceof ConflictError) {
    statusCode = 409;
    message = error.message;
  } else if (error instanceof UnauthorizedError) {
    statusCode = 401;
    message = error.message;
  } else if (error instanceof InternalServerError) {
    statusCode = 500;
    message = error.message;
  }

  return res.status(statusCode).send({ message });
};

export default errorHandler;
