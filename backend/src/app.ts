import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';
import ProductRoutes from './routes/product';
import UserRoutes from './routes/auth';
import OrderRoutes from './routes/order';
import UploadRoutes from './routes/upload';
import errorHandler from './middlewares/error-handler';
import NotFoundError from './errors/not-found-error';
import { requestLogger, errorLogger } from './middlewares/logger';

const { PORT = 3000 } = process.env;

const app = express();
const allowedOrigin = process.env.ORIGIN_ALLOW || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect('mongodb://localhost:27017/weblarek')
  .then(() => console.log('Успешное подключение к бд'))
  .catch((err) => console.error('Ошибка при подключении к бд:', err));

app.use(requestLogger);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/auth', UserRoutes);
app.use('/product', ProductRoutes);
app.use('/upload', UploadRoutes);
app.use('/order', OrderRoutes);

app.use('*', (_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.use(errorLogger);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
