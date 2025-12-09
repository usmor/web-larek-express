import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface SessionRequest extends Request {
    userId?: string | JwtPayload;
}

const handleAuthError = (res: Response) => {
  res
    .status(401)
    .send({ message: 'Необходима авторизация' });
};

const extractBearerToken = (header: string) => header.replace('Bearer ', '');

export default (req: SessionRequest, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return handleAuthError(res);
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY || 'access_token_secret_key');
  } catch (err) {
    return handleAuthError(res);
  }

  if (typeof payload === 'object' && payload !== null && '_id' in payload) {
    req.userId = payload._id as string;
    return next();
  }
  return next();
};
