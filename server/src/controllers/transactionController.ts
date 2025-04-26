import { Request, Response } from 'express';
import { asyncHandler, ErrorResponse } from '../middleware/errorMiddleware';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import moment from 'moment';
import mongoose from 'mongoose';

/**
 * @desc    Get all transactions with filtering, sorting, and pagination
 * @route   GET /api/transactions
 * @access  Public
 */
export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    sort = '-date',
    startDate,
    endDate,
    category
  } = req.query;
  
  // Build query
  const query: any = {};
  
  // Filter by date range
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate as string);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate as string);
    }
  }
  
  // Filter by category
  if (category) {
    query.category = category;
  }
  
  // Execute query with pagination
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;
  
  const transactions = await Transaction.find(query)
    .populate('category', 'name icon color')
    .sort(sort as string)
    .skip(skip)
    .limit(limitNum);
  
  // Get total documents
  const totalTransactions = await Transaction.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: transactions.length,
    pagination: {
      current: pageNum,
      limit: limitNum,
      total: Math.ceil(totalTransactions / limitNum),
      totalRecords: totalTransactions
    },
    data: transactions
  });
});

/**
 * @desc    Get single transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Public
 */
export const getTransactionById = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findById(req.params.id).populate('category');
  
  if (!transaction) {
    throw new ErrorResponse(`Transaction not found with id of ${req.params.id}`, 404);
  }
  
  res.status(200).json({
    success: true,
    data: transaction
  });
});

/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Public
 */
export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  // Verify category exists
  const categoryExists = await Category.exists({ _id: req.body.category });
  
  if (!categoryExists) {
    throw new ErrorResponse(`Category not found with id of ${req.body.category}`, 404);
  }
  
  const transaction = await Transaction.create(req.body);
  
  res.status(201).json({
    success: true,
    data: transaction
  });
});

/**
 * @desc    Update transaction
 * @route   PUT /api/transactions/:id
 * @access  Public
 */
export const updateTransaction = asyncHandler(async (req: Request, res: Response) => {
  let transaction = await Transaction.findById(req.params.id);
  
  if (!transaction) {
    throw new ErrorResponse(`Transaction not found with id of ${req.params.id}`, 404);
  }
  
  // Verify category exists if updating category
  if (req.body.category) {
    const categoryExists = await Category.exists({ _id: req.body.category });
    
    if (!categoryExists) {
      throw new ErrorResponse(`Category not found with id of ${req.body.category}`, 404);
    }
  }
  
  transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('category');
  
  res.status(200).json({
    success: true,
    data: transaction
  });
});

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 * @access  Public
 */
export const deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findById(req.params.id);
  
  if (!transaction) {
    throw new ErrorResponse(`Transaction not found with id of ${req.params.id}`, 404);
  }
  
  await transaction.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get monthly expenses for bar chart
 * @route   GET /api/transactions/monthly
 * @access  Public
 */
export const getMonthlyExpenses = asyncHandler(async (req: Request, res: Response) => {
  const { year = new Date().getFullYear() } = req.query;
  
  const monthlyExpenses = await Transaction.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { month: { $month: '$date' } },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        totalAmount: 1,
        count: 1
      }
    },
    { $sort: { month: 1 } }
  ]);
  
  // Fill in missing months with zero values
  const allMonths = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    totalAmount: 0,
    count: 0
  }));
  
  const filledMonthlyExpenses = allMonths.map(month => {
    const existingMonth = monthlyExpenses.find(
      (m: any) => m.month === month.month
    );
    return existingMonth || month;
  });
  
  res.status(200).json({
    success: true,
    data: filledMonthlyExpenses
  });
});