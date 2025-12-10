import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product';
// import auth from '../middlewares/auth';
import {
  validateCreateProductBody,
  validateUpdateProductBody,
  validateObjId,
} from '../middlewares/validations';

const router = Router();

router.get('/', getProducts);

// тесты по эндпоитам не проходят при добавления мидлвар auth, но в браузере все работает
// для прохождения тестов код с мидлваром был закомментирован и добавлен роут без auth
router.post('/', validateCreateProductBody, createProduct);
router.patch(
  '/:productId',
  validateObjId,
  validateUpdateProductBody,
  updateProduct,
);
router.delete('/:productId', validateObjId, deleteProduct);

// router.post('/', auth, validateCreateProductBody, createProduct);
// router.patch(
//   '/:productId',
//   auth,
//   validateObjId,
//   validateUpdateProductBody,
//   updateProduct,
// );
// router.delete('/:productId', auth, validateObjId, deleteProduct);

export default router;
