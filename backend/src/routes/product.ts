import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product';
import auth from '../middlewares/auth';
import {
  validateCreateProductBody,
  validateUpdateProductBody,
  validateObjId,
} from '../middlewares/validations';

const router = Router();

router.get('/', getProducts);
router.post('/', auth, validateCreateProductBody, createProduct);
router.patch(
  '/:productId',
  auth,
  validateObjId,
  validateUpdateProductBody,
  updateProduct,
);
router.delete('/:productId', auth, validateObjId, deleteProduct);

export default router;
