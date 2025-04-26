import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTransactions
} from '../controllers/categoryController';
import { validate } from '../middleware/validationMiddleware';
import { categoryValidators } from '../utils/validators';

const router = express.Router();

// Get category transactions for pie chart
router.get('/transactions', getCategoryTransactions);

// Basic CRUD routes
router
  .route('/')
  .get(getCategories)
  .post(validate(categoryValidators.createCategory), createCategory);

router
  .route('/:id')
  .get(validate(categoryValidators.getCategoryById), getCategoryById)
  .put(validate(categoryValidators.updateCategory), updateCategory)
  .delete(validate(categoryValidators.deleteCategory), deleteCategory);

export default router;