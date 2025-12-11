import { CelebrateError } from 'celebrate';
import { Request, Response, NextFunction } from 'express';

const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof CelebrateError) {
    const message = error.details.get('body')?.details[0].message
      || 'Некорректные данные';
    return res.status(400).send({ message });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).send({ message: error.message });
  }

  return res.status(500).send({ message: 'Внутренняя ошибка сервера' });
};

export default errorHandler;
