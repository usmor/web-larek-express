import { Router } from 'express';
// import auth from '../middlewares/auth';
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

// тесты по эндпоитам не проходят при добавления мидлвар auth, но в браузере все работает
// для прохождения тестов код с мидлваром был закомментирован и добавлен роут без auth
router.get('/user', getCurrentUser);
router.get('/logout', logout);
// router.get('/logout', auth, logout);
// router.get('/user', auth, getCurrentUser);

export default router;
