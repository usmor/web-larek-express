import { celebrate, Joi, Segments } from 'celebrate';
import { IProduct } from '../models/product';

const createProductBodySchema = Joi.object<IProduct>({
  title: Joi.string().min(2).max(30).required()
    .messages({
      'string.empty': 'Поле "title" должно быть заполнено',
      'string.min': 'Минимальная длина поля "title" - 2',
      'string.max': 'Максимальная длина поля "title" - 30',
    }),
  image: Joi.object({
    fileName: Joi.string().required().messages({
      'string.empty': 'Поле "fileName" должно быть заполнено',
    }),
    originalName: Joi.string().required().messages({
      'string.empty': 'Поле "originalName" должно быть заполнено',
    }),
  }).required(),
  category: Joi.string().required().messages({
    'string.empty': 'Поле "category" должно быть заполнено',
  }),
  description: Joi.string().optional(),
  price: Joi.number().allow(null).optional(),
});

const orderBodySchema = Joi.object({
  payment: Joi.string().valid('card', 'online').required().messages({
    'string.empty': 'Поле "payment" должно быть заполнено',
    'any.only': 'Допустимые значения payment: card, online',
    'any.required': 'Поле "payment" обязательно для заполнения',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Поле "email" должно быть заполнено',
    'string.email': 'Некорректный формат email',
    'any.required': 'Поле "email" обязательно для заполнения',
  }),
  phone: Joi.string().required().messages({
    'string.empty': 'Поле "phone" должно быть заполнено',
    'any.required': 'Поле "phone" обязательно для заполнения',
  }),
  address: Joi.string().required().messages({
    'string.empty': 'Поле "address" должно быть заполнено',
    'any.required': 'Поле "address" обязательно для заполнения',
  }),
  total: Joi.number().required().messages({
    'string.empty': 'Поле "total" должно быть заполнено',
  }),
  items: Joi.array()
    .items(Joi.string().hex().length(24))
    .min(1)
    .required()
    .messages({
      'array.min': 'Список товаров не может быть пустым',
      'string.hex': 'ID товара должен быть в hex формате',
      'string.length': 'ID товара должен быть длиной 24 символа',
      'any.required': 'Поле "items" обязательно для заполнения',
    }),
});

export const validateCreateProductBody = celebrate({
  [Segments.BODY]: createProductBodySchema,
});

export const validateOrderBody = celebrate({
  [Segments.BODY]: orderBodySchema,
});

export const validateObjId = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    productId: Joi.string().hex().length(24).required(),
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Поле "email" должно быть заполнено',
    'string.email': 'Некорректный формат email',
    'any.required': 'Поле "email" обязательно для заполнения',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Поле "password" должно быть заполнено',
    'string.min': 'Поле "password" должно содержать не менее 6 символов',
    'any.required': 'Поле "password" обязательно для заполнения',
  }),
});

export const validateLoginUserBody = celebrate({
  [Segments.BODY]: loginSchema,
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(30).messages({
    'string.empty': 'Поле "name" должно быть заполнено',
    'any.required': 'Поле "name" обязательно для заполнения',
    'string.min': 'Поле "name" должно содержать не менее 2 символов',
    'string.max': 'Поле "name" должно содержать не более 30 символов',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Поле "email" должно быть заполнено',
    'string.email': 'Некорректный формат email',
    'any.required': 'Поле "email" обязательно для заполнения',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Поле "password" должно быть заполнено',
    'string.min': 'Поле "password" должно содержать не менее 6 символов',
    'any.required': 'Поле "password" обязательно для заполнения',
  }),
});

export const validateRegisterUserBody = celebrate({
  [Segments.BODY]: registerSchema,
});

const updateProductBodySchema = Joi.object<IProduct>({
  title: Joi.string().min(2).max(30).messages({
    'string.min': 'Минимальная длина поля "title" - 2',
    'string.max': 'Максимальная длина поля "title" - 30',
  }),

  image: Joi.object({
    fileName: Joi.string().messages({
      'string.empty': 'Поле "fileName" должно быть заполнено',
    }),
    originalName: Joi.string().messages({
      'string.empty': 'Поле "originalName" должно быть заполнено',
    }),
  }),

  category: Joi.string().messages({
    'string.empty': 'Поле "category" должно быть заполнено',
  }),

  description: Joi.string().messages({
    'string.empty': 'Поле "description" должно быть заполнено',
  }),

  price: Joi.number().allow(null).messages({
    'number.base': 'Поле "price" должно быть числом',
  }),
}).min(1);

export const validateUpdateProductBody = celebrate({
  [Segments.BODY]: updateProductBodySchema,
});
