import { Request, Response } from 'express';
import { asyncHandler, ErrorResponse } from '../middleware/errorMiddleware';
import Budget from '../models/Budget';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

/**
 * @desc    Get all budgets with filtering
 * @route   GET /api/budgets
 * @access  Public
 */
export const getBudgets = asyncHandler(async (req: Request, res: Response) => {
  const { month, year, category } = req.query;
  
  // Build query
  const query: any = {};
  
  // Filter by month
  if (month) {
    query.month = parseInt(month as string, 10);
  }
  
  // Filter by year
  if (year) {
    query.year = parseInt(year as string, 10);
  }
  
  // Filter by category
  if (category) {
    query.category = category;
  }
  
  const budgets = await Budget.find(query)
    .populate('category', 'name icon color')
    .sort({ year: -1, month: -1 });
  
  res.status(200).json({
    success: true,
    count: budgets.length,
    data: budgets
  });
});

/**
 * @desc    Get single budget by ID
 * @route   GET /api/budgets/:id
 * @access  Public
 */
export const getBudgetById = asyncHandler(async (req: Request, res: Response) => {
  const budget = await Budget.findById(req.params.id).populate('category');
  
  if (!budget) {
    throw new ErrorResponse(`Budget not found with id of ${req.params.id}`, 404);
  }
  
  res.status(200).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Create a new budget
 * @route   POST /api/budgets
 * @access  Public
 */
export const createBudget = asyncHandler(async (req: Request, res: Response) => {
  // Verify category exists
  const categoryExists = await Category.exists({ _id: req.body.category });
  
  if (!categoryExists) {
    throw new ErrorResponse(`Category not found with id of ${req.body.category}`, 404);
  }
  
  // Check if budget already exists for this month/year/category
  const existingBudget = await Budget.findOne({
    month: req.body.month,
    year: req.body.year,
    category: req.body.category
  });
  
  if (existingBudget) {
    throw new ErrorResponse(
      `Budget already exists for this category in ${req.body.month}/${req.body.year}`,
      400
    );
  }
  
  const budget = await Budget.create(req.body);
  
  res.status(201).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Update budget
 * @route   PUT /api/budgets/:id
 * @access  Public
 */
export const updateBudget = asyncHandler(async (req: Request, res: Response) => {
  let budget = await Budget.findById(req.params.id);
  
  if (!budget) {
    throw new ErrorResponse(`Budget not found with id of ${req.params.id}`, 404);
  }
  
  // Verify category exists if updating category
  if (req.body.category) {
    const categoryExists = await Category.exists({ _id: req.body.category });
    
    if (!categoryExists) {
      throw new ErrorResponse(`Category not found with id of ${req.body.category}`, 404);
    }
    
    // Check for duplicate budget if changing category/month/year
    if (
      req.body.category !== budget.category.toString() ||
      (req.body.month && req.body.month !== budget.month) ||
      (req.body.year && req.body.year !== budget.year)
    ) {
      const month = req.body.month || budget.month;
      const year = req.body.year || budget.year;
      const category = req.body.category;
      
      const existingBudget = await Budget.findOne({
        month,
        year,
        category
      });
      
      if (existingBudget) {
        throw new ErrorResponse(
          `Budget already exists for this category in ${month}/${year}`,
          400
        );
      }
    }
  }
  
  budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('category');
  
  res.status(200).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Delete budget
 * @route   DELETE /api/budgets/:id
 * @access  Public
 */
export const deleteBudget = asyncHandler(async (req: Request, res: Response) => {
  const budget = await Budget.findById(req.params.id);
  
  if (!budget) {
    throw new ErrorResponse(`Budget not found with id of ${req.params.id}`, 404);
  }
  
  await budget.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get budget vs actual spending comparison
 * @route   GET /api/budgets/comparison
 * @access  Public
 */
export const getBudgetComparison = asyncHandler(async (req: Request, res: Response) => {
  const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
  
  const monthNum = parseInt(month as string, 10);
  const yearNum = parseInt(year as string, 10);
  
  // Get all budgets for the specified month/year
  const budgets = await Budget.find({
    month: monthNum,
    year: yearNum
  }).populate('category', 'name icon color');
  
  // Get start and end dates for the month
  const startDate = new Date(yearNum, monthNum - 1, 1);
  const endDate = new Date(yearNum, monthNum, 0); // Last day of the month
  
  // Get actual spending by category for the month
  const actualSpending = await Transaction.aggregate([
    {
      $match: {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$category',
        actualAmount: { $sum: '$amount' }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    { $unwind: '$categoryInfo' },
    {
      $project: {
        _id: 1,
        category: '$categoryInfo.name',
        color: '$categoryInfo.color',
        icon: '$categoryInfo.icon',
        actualAmount: 1
      }
    }
  ]);
  
  // Map budget data with actual spending
  const comparisonData = budgets.map((budget: any) => {
    const actual = actualSpending.find((item: any) => 
      item._id.toString() === budget.category._id.toString()
    );
    
    return {
      category: budget.category.name,
      color: budget.category.color,
      icon: budget.category.icon,
      plannedAmount: budget.plannedAmount,
      actualAmount: actual ? actual.actualAmount : 0,
      difference: (actual ? actual.actualAmount : 0) - budget.plannedAmount,
      percentageUsed: actual 
        ? Math.round((actual.actualAmount / budget.plannedAmount) * 100) 
        : 0
    };
  });
  
  // Also include categories with spending but no budget
  const categoriesWithoutBudget = actualSpending.filter(
    (item: any) => !budgets.some((b: any) => b.category._id.toString() === item._id.toString())
  );
  
  categoriesWithoutBudget.forEach((item: any) => {
    comparisonData.push({
      category: item.category,
      color: item.color,
      icon: item.icon,
      plannedAmount: 0,
      actualAmount: item.actualAmount,
      difference: item.actualAmount,
      percentageUsed: Infinity // No budget, so percentage is infinite
    });
  });
  
  res.status(200).json({
    success: true,
    count: comparisonData.length,
    month: monthNum,
    year: yearNum,
    data: comparisonData
  });
});