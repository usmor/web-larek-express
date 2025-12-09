import { Router } from 'express';
import auth from '../middlewares/auth';
import {
  getCurrentUser,
  login,
  register,
  logout,
  refreshAccessToken,
} from '../controllers/auth';
import {
  validateLoginUserBody,
  validateRegisterUserBody,
} from '../middlewares/validations';

const router = Router();

router.post('/login', validateLoginUserBody, login);
router.post('/register', validateRegisterUserBody, register);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);

export default router;
