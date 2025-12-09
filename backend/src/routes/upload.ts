import { Router } from 'express';
import auth from '../middlewares/auth';
import fileMiddleware from '../middlewares/file';
import { uploadFile } from '../controllers/product';

const router = Router();
router.post('/', auth, fileMiddleware.single('file'), uploadFile);

export default router;
