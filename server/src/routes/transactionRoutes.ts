import express from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlyExpenses
} from '../controllers/transactionController';
import { validate } from '../middleware/validationMiddleware';
import { transactionValidators } from '../utils/validators';

const router = express.Router();

// Get monthly expenses for bar chart
router.get('/monthly', getMonthlyExpenses);

// Basic CRUD routes
router
  .route('/')
  .get(validate(transactionValidators.getTransactions), getTransactions)
  .post(validate(transactionValidators.createTransaction), createTransaction);

router
  .route('/:id')
  .get(validate(transactionValidators.getTransactionById), getTransactionById)
  .put(validate(transactionValidators.updateTransaction), updateTransaction)
  .delete(validate(transactionValidators.deleteTransaction), deleteTransaction);

export default router;