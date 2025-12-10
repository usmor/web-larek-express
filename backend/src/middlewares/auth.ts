import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error';

export interface SessionRequest extends Request {
    userId?: string | JwtPayload;
}

const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY || 'access_token_secret_key';

const auth = async (
  req: SessionRequest,
  _res: Response,
  next: NextFunction,
) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const accessToken = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET_KEY);
  } catch (error) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  req.userId = payload;

  return next();
};

export default auth;
