import { Request, Response } from 'express';
import { asyncHandler, ErrorResponse } from '../middleware/errorMiddleware';
import Category, { ICategory } from '../models/Category';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Category.find().sort('name');
  
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

/**
 * @desc    Get single category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    throw new ErrorResponse(`Category not found with id of ${req.params.id}`, 404);
  }
  
  res.status(200).json({
    success: true,
    data: category
  });
});

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Public
 */
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.create(req.body);
  
  res.status(201).json({
    success: true,
    data: category
  });
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Public
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  let category = await Category.findById(req.params.id);
  
  if (!category) {
    throw new ErrorResponse(`Category not found with id of ${req.params.id}`, 404);
  }
  
  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: category
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Public
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    throw new ErrorResponse(`Category not found with id of ${req.params.id}`, 404);
  }
  
  // Check if any transactions use this category
  const transactionCount = await Transaction.countDocuments({ category: req.params.id });
  
  if (transactionCount > 0) {
    throw new ErrorResponse(
      `Cannot delete category that has ${transactionCount} associated transactions. Update or delete the transactions first.`,
      400
    );
  }
  
  await category.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get transactions grouped by categories for pie chart
 * @route   GET /api/categories/transactions
 * @access  Public
 */
export const getCategoryTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  
  const dateFilter: any = {};
  if (startDate) {
    dateFilter.$gte = new Date(startDate as string);
  }
  if (endDate) {
    dateFilter.$lte = new Date(endDate as string);
  }
  
  const matchStage: any = {};
  if (Object.keys(dateFilter).length > 0) {
    matchStage.date = dateFilter;
  }
  
  const categoryTransactions = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
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
        category: '$categoryInfo.name',
        color: '$categoryInfo.color',
        icon: '$categoryInfo.icon',
        totalAmount: 1,
        count: 1
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
  
  res.status(200).json({
    success: true,
    count: categoryTransactions.length,
    data: categoryTransactions
  });
});