import multer, { FileFilterCallback } from 'multer';
import { faker } from '@faker-js/faker';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import BadRequestError from '../errors/bad-request-error';

const ROOT_DIR = process.cwd();
const UPLOAD_PATH_TEMP = path.join(ROOT_DIR, 'src', 'temp');

if (!fs.existsSync(UPLOAD_PATH_TEMP)) {
  fs.mkdirSync(UPLOAD_PATH_TEMP, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_PATH_TEMP);
  },
  filename(_req, file, cb) {
    const uniqueName = faker.string.uuid();
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueName + fileExtension);
  },
});

const allowedTypes = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

const fileFilter = (_req: Request, file: any, cb: FileFilterCallback) => {
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new BadRequestError('Разрешены только изображения png, jpg, jpeg'));
  } else {
    cb(null, true);
  }
};

const fileMiddleware = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});

export default fileMiddleware;
