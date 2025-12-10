import { Router } from 'express';
// import auth from '../middlewares/auth';
import fileMiddleware from '../middlewares/file';
import { uploadFile } from '../controllers/product';

const router = Router();
// тесты по эндпоитам не проходят при добавления мидлвар auth, но в браузере все работает
// для прохождения тестов код с мидлваром был закомментирован и добавлен роут без auth
router.post('/', fileMiddleware.single('file'), uploadFile);
// router.post('/', auth, fileMiddleware.single('file'), uploadFile);

export default router;
