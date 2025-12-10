import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { orderData } = req.body;

  try {
    const products = await Product.find({ _id: { $in: orderData.items } });

    if (products.length !== orderData.items.length) {
      return next(
        new BadRequestError('Один или несколько товаров не существуют'),
      );
    }

    if (products.some((p) => p.price === null)) {
      return next(
        new BadRequestError('Один или несколько товаров не продаются'),
      );
    }

    const calculatedTotal = products.reduce(
      (acc, product) => acc + product.price!,
      0,
    );

    if (calculatedTotal !== orderData.total) {
      return next(
        new BadRequestError(
          `Неверная сумма заказа. Ожидается ${calculatedTotal}`,
        ),
      );
    }
  } catch (error) {
    return next(error);
  }

  const orderId = faker.string.uuid();

  return res.status(200).send({
    id: orderId,
    total: orderData.total,
  });
};

export default createOrder;
