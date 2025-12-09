import bcrypt from 'bcryptjs';
import {
  model, Model, Schema, HydratedDocument,
} from 'mongoose';
import BadRequestError from '../errors/bad-request-error';

interface IToken {
  token: string;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: IToken[];
}

interface IUserModel extends Model<IUser> {
  findUserByCredentials: (
    email: string,
    password: string
  ) => Promise<HydratedDocument<IUser>>;
}

const tockenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
    },
  },
  {
    versionKey: false,
  },
);

export const userSchema = new Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      minlength: [2, 'Минимальная длина поля "name" - 2'],
      maxlength: [30, 'Максимальная длина поля "name" - 30'],
      required: false,
      default: 'Ё-мое',
    },
    email: {
      type: String,
      required: [true, 'Поле "email" должно быть заполнено'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Поле "password" должно быть заполнено'],
      minlength: [6, 'Минимальная длина поля "password" - 2'],
      select: false,
    },
    tokens: {
      type: [tockenSchema],
      select: false,
    },
  },
  {
    versionKey: false,
  },
);

userSchema.static(
  'findUserByCredentials',
  async function findUserByCredentials(email: string, password: string) {
    try {
      const user = await this.findOne({ email })
        .select('+password')
        .select('+tokens');
      const match = await bcrypt.compare(password, user!.password);
      if (!match) {
        return Promise.reject(new BadRequestError('Неверная почта или пароль'));
      }
      return Promise.resolve(user);
    } catch (error) {
      return Promise.reject(new BadRequestError('Неверная почта или пароль'));
    }
  },
);

export default model<IUser, IUserModel>('user', userSchema);
