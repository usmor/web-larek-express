import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    if (
      !payment
      || !email
      || !phone
      || !address
      || total === undefined
      || !items
    ) {
      return next(
        new BadRequestError('Ошибка валидации данных при создании заказа'),
      );
    }

    if (!['card', 'online'].includes(payment)) {
      return next(new BadRequestError('Неверный способ оплаты'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new BadRequestError('Некорректный email'));
    }

    if (!Array.isArray(items) || items.length === 0) {
      return next(new BadRequestError('items должен быть непустым массивом'));
    }

    const products = await Product.find({ _id: { $in: items } });

    if (products.length !== items.length) {
      return next(
        new BadRequestError('Один или несколько товаров не существуют'),
      );
    }

    const notForSaleItems = products.filter((p) => p.price === null);

    if (notForSaleItems.length > 0) {
      const titles = notForSaleItems.map((p) => `"${p.title}"`).join(', ');
      return next(
        new BadRequestError(`Следующие товары не продаются: ${titles}`),
      );
    }

     const calculatedTotal = products.reduce((acc, product) => acc + product.price!, 0);
     
    if (calculatedTotal !== total) {
      return next(
        new BadRequestError(
          `Неверная сумма заказа. Ожидается ${calculatedTotal}`,
        ),
      );
    }

    const orderId = faker.string.uuid();

    return res.status(200).send({
      id: orderId,
      total,
    });
  } catch (error) {
    return next(error);
  }
};

export default createOrder;
