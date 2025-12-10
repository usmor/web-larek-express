import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SessionRequest } from '../middlewares/auth';
import User from '../models/user';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import ConflictError from '../errors/conflict-error';
import convertToMs from '../utils/convert-to-ms';
import UnauthorizedError from '../errors/unauthorized-error';
import {
  ACCESS_TOKEN_SECRET_KEY,
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET_KEY,
} from '../config';

export const getCurrentUser = async (
  req: SessionRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  let user;

  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    return next(
      new NotFoundError('Пользователь по заданному id отсутствует в базе'),
    );
  }

  return res.status(200).send({
    user: {
      email: user!.email,
      name: user!.name,
    },
    success: true,
  });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    let user = await User.findUserByCredentials(email, password);

    const accessToken = jwt.sign({ _id: user._id }, ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
    });
    const refreshToken = jwt.sign({ _id: user._id }, REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
    });

    user.tokens.push({ token: refreshToken });
    user = await user.save();

    res.cookie('REFRESH_TOKEN', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: convertToMs(AUTH_REFRESH_TOKEN_EXPIRY),
    });

    res.status(200).send({
      user: {
        email: user.email,
        name: user.name,
      },
      success: true,
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    let newUser = await User.create({
      name,
      email,
      password: hashPassword,
    });
    const accessToken = jwt.sign(
      { _id: newUser._id },
      ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] },
    );
    const refreshToken = jwt.sign(
      { _id: newUser._id },
      REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] },
    );

    newUser.tokens.push({ token: refreshToken });
    newUser = await newUser.save();

    res.cookie('REFRESH_TOKEN', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: convertToMs(AUTH_REFRESH_TOKEN_EXPIRY),
    });

    res.status(201).send({
      user: {
        email: newUser.email,
        name: newUser.name,
      },
      success: true,
      accessToken,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error instanceof MongooseError.ValidationError) {
        return next(new BadRequestError('Ошибка в валидации данных'));
      }
      if (error.message.includes('E11000')) {
        return next(
          new ConflictError('Пользователь с таким email-ом уже существует.'),
        );
      }
    }
    return next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies.REFRESH_TOKEN;

  if (!refreshToken) {
    return next(new BadRequestError('Неверные данные'));
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY);
  } catch (error) {
    return next(new BadRequestError('Неверные данные'));
  }

  let user;
  try {
    user = await User.findById(payload).select('+tokens');
  } catch (error) {
    return next(error);
  }

  if (!user) {
    return next(new NotFoundError('Пользователь не найден'));
  }

  user.tokens = [];
  user = await user.save();

  const expiredRefreshToken = jwt.sign(
    { _id: user._id },
    REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: 0 },
  );

  res.cookie('REFRESH_TOKEN', expiredRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
  });

  res.status(200).send({
    success: true,
  });
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let refreshToken = req.cookies.REFRESH_TOKEN;

  if (!refreshToken) {
    return next(new BadRequestError('Неверные данные'));
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY);
  } catch (error) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  let user;
  try {
    user = await User.findById(payload).select('+tokens');
  } catch (error) {
    return next(error);
  }

  if (!user) {
    return next(new NotFoundError('Пользователь не найден'));
  }

  const accessToken = jwt.sign({ _id: user._id }, ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
  });

  refreshToken = jwt.sign({ _id: user._id }, REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
  });

  user.tokens.push({ token: refreshToken });
  user = await user.save();

  res.cookie('REFRESH_TOKEN', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: convertToMs(AUTH_REFRESH_TOKEN_EXPIRY),
  });

  res.status(200).send({
    user: {
      email: user.email,
      name: user.name,
    },
    success: true,
    accessToken,
  });
};
