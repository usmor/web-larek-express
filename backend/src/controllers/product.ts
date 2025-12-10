import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { Error } from 'mongoose';
import Product from '../models/product';
import InternalServerError from '../errors/internal-server-error';
import ConflictError from '../errors/conflict-error';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';

const ROOT_DIR = process.cwd();

const UPLOAD_PATH = path.join(ROOT_DIR, 'src', 'public', 'images');

const UPLOAD_PATH_TEMP = path.join(ROOT_DIR, 'src', 'temp');

if (!fs.existsSync(UPLOAD_PATH_TEMP)) {
  fs.mkdirSync(UPLOAD_PATH_TEMP, { recursive: true });
}

if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

export const getProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await Product.find({});
    return res.status(200).send({ items: products, total: products.length });
  } catch (error) {
    return next(new InternalServerError('Ошибка при получении товаров'));
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    if (!title || !title.trim()) {
      return next(new BadRequestError('Поле "title" должно быть заполнено'));
    }

    const existingProduct = await Product.findOne({ title });
    if (existingProduct) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }

    if (image?.fileName) {
      const tempPath = path.join(
        UPLOAD_PATH_TEMP,
        path.basename(image.fileName),
      );

      const permPath = path.join(
        UPLOAD_PATH,
        path.basename(image.fileName),
      );

      if (fs.existsSync(tempPath)) {
        try {
          await fs.promises.rename(tempPath, permPath);
        } catch (error) {
          return next(new InternalServerError());
        }
      }
    }

    const product = await Product.create({
      title,
      image,
      category,
      description,
      price: price ?? null,
    });

    return res.status(201).send(product);
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(
        new ConflictError('Товар с таким названием уже существует'),
      );
    }
    if (error instanceof Error.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    return next(new InternalServerError('Ошибка при создании товара'));
  }
};

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new BadRequestError('Файл не загружен'));
  }

  return res.send({
    fileName: `/images/${req.file?.filename}`,
    originalName: req.file?.originalname,
  });
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const product = req.body;

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return next(new NotFoundError('Товар не найден'));
    }

    if (product.image?.fileName) {
      const tempPath = path.join(
        UPLOAD_PATH_TEMP,
        path.basename(product.image.fileName),
      );

      const permPath = path.join(
        UPLOAD_PATH,
        path.basename(product.image.fileName),
      );

      let fileMoved = false;

      if (fs.existsSync(tempPath)) {
        await fs.promises.rename(tempPath, permPath);
        fileMoved = true;
      }

      if (fileMoved && currentProduct.image?.fileName) {
        const oldFilePath = path.join(
          UPLOAD_PATH,
          path.basename(currentProduct.image.fileName),
        );

        fs.promises.unlink(oldFilePath).catch(() => {});
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, product, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return next(new NotFoundError('Товар не найден'));
    }

    res.status(200).send(updatedProduct);
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    return next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return next(new NotFoundError('Товар не найден'));
    }

    res.send(product);
  } catch (error) {
    return next(error);
  }
};
