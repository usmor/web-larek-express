import 'dotenv/config';
import path from 'path';
import fs from 'fs';

export const PORT = process.env.PORT || 3000;
export const ORIGIN_ALLOW = process.env.ORIGIN_ALLOW || 'http://localhost:5173';

export const DB_ADDRESS = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek';

export const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY || 'access_token_secret_key';
export const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY || 'refresh_token_secret_key';
export const AUTH_ACCESS_TOKEN_EXPIRY = process.env.AUTH_ACCESS_TOKEN_EXPIRY || '15m';
export const AUTH_REFRESH_TOKEN_EXPIRY = process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d';

const ROOT_DIR = __dirname;

export const UPLOAD_PATH = process.env.UPLOAD_PATH
  ? path.join(ROOT_DIR, 'public', process.env.UPLOAD_PATH)
  : path.join(ROOT_DIR, 'public', 'images');

export const UPLOAD_PATH_TEMP = process.env.UPLOAD_PATH_TEMP
  ? path.join(ROOT_DIR, process.env.UPLOAD_PATH_TEMP)
  : path.join(ROOT_DIR, 'temp');

if (!fs.existsSync(UPLOAD_PATH_TEMP)) {
  fs.mkdirSync(UPLOAD_PATH_TEMP, { recursive: true });
}

if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}
