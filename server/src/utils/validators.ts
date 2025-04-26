import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

// Helper to validate MongoDB ObjectId
const isValidObjectId = (value: string) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Category validators
export const categoryValidators = {
  createCategory: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Category name must be between 2 and 50 characters'),
    body('icon').optional().isString().withMessage('Icon must be a string'),
    body('color')
      .optional()
      .isString()
      .withMessage('Color must be a string')
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Color must be a valid hex color code')
  ],
  updateCategory: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid category ID format'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Category name cannot be empty')
      .isLength({ min: 2, max: 50 })
      .withMessage('Category name must be between 2 and 50 characters'),
    body('icon').optional().isString().withMessage('Icon must be a string'),
    body('color')
      .optional()
      .isString()
      .withMessage('Color must be a string')
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Color must be a valid hex color code')
  ],
  getCategoryById: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid category ID format')
  ],
  deleteCategory: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid category ID format')
  ]
};

// Transaction validators
export const transactionValidators = {
  createTransaction: [
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isNumeric()
      .withMessage('Amount must be a number'),
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Date must be a valid ISO8601 date'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Description must be between 3 and 200 characters'),
    body('category')
      .notEmpty()
      .withMessage('Category is required')
      .custom(isValidObjectId)
      .withMessage('Invalid category ID format')
  ],
  updateTransaction: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid transaction ID format'),
    body('amount')
      .optional()
      .isNumeric()
      .withMessage('Amount must be a number'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO8601 date'),
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Description cannot be empty')
      .isLength({ min: 3, max: 200 })
      .withMessage('Description must be between 3 and 200 characters'),
    body('category')
      .optional()
      .custom(isValidObjectId)
      .withMessage('Invalid category ID format')
  ],
  getTransactionById: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid transaction ID format')
  ],
  deleteTransaction: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid transaction ID format')
  ],
  getTransactions: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sort').optional().isString().withMessage('Sort must be a string'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
    query('category').optional().custom(isValidObjectId).withMessage('Invalid category ID format')
  ]
};

// Budget validators
export const budgetValidators = {
  createBudget: [
    body('month')
      .notEmpty()
      .withMessage('Month is required')
      .isInt({ min: 1, max: 12 })
      .withMessage('Month must be between 1 and 12'),
    body('year')
      .notEmpty()
      .withMessage('Year is required')
      .isInt({ min: 2000 })
      .withMessage('Year must be 2000 or later'),
    body('category')
      .notEmpty()
      .withMessage('Category is required')
      .custom(isValidObjectId)
      .withMessage('Invalid category ID format'),
    body('plannedAmount')
      .notEmpty()
      .withMessage('Planned amount is required')
      .isNumeric()
      .withMessage('Planned amount must be a number')
      .isFloat({ min: 0 })
      .withMessage('Planned amount must be positive')
  ],
  updateBudget: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid budget ID format'),
    body('month')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Month must be between 1 and 12'),
    body('year')
      .optional()
      .isInt({ min: 2000 })
      .withMessage('Year must be 2000 or later'),
    body('category')
      .optional()
      .custom(isValidObjectId)
      .withMessage('Invalid category ID format'),
    body('plannedAmount')
      .optional()
      .isNumeric()
      .withMessage('Planned amount must be a number')
      .isFloat({ min: 0 })
      .withMessage('Planned amount must be positive')
  ],
  getBudgetById: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid budget ID format')
  ],
  deleteBudget: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid budget ID format')
  ],
  getBudgets: [
    query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    query('year').optional().isInt({ min: 2000 }).withMessage('Year must be 2000 or later'),
    query('category').optional().custom(isValidObjectId).withMessage('Invalid category ID format')
  ]
};