import express from 'express';
import {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetComparison
} from '../controllers/budgetController';
import { validate } from '../middleware/validationMiddleware';
import { budgetValidators } from '../utils/validators';

const router = express.Router();

// Get budget vs actual comparison
router.get('/comparison', getBudgetComparison);

// Basic CRUD routes
router
  .route('/')
  .get(validate(budgetValidators.getBudgets), getBudgets)
  .post(validate(budgetValidators.createBudget), createBudget);

router
  .route('/:id')
  .get(validate(budgetValidators.getBudgetById), getBudgetById)
  .put(validate(budgetValidators.updateBudget), updateBudget)
  .delete(validate(budgetValidators.deleteBudget), deleteBudget);

export default router;