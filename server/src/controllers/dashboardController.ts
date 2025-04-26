import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import Budget from '../models/Budget';
import moment from 'moment';

/**
 * @desc    Get dashboard summary data
 * @route   GET /api/dashboard
 * @access  Public
 */
export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Get start and end dates for the month
  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0); // Last day of the month
  
  // Get total expenses for current month
  const monthlyExpenses = await Transaction.aggregate([
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
        _id: null,
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  const totalMonthlyExpenses = monthlyExpenses.length > 0 ? monthlyExpenses[0].totalAmount : 0;
  const transactionCount = monthlyExpenses.length > 0 ? monthlyExpenses[0].count : 0;
  
  // Get category breakdown for current month
  const categoryBreakdown = await Transaction.aggregate([
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
        _id: 0,
        category: '$categoryInfo.name',
        color: '$categoryInfo.color',
        icon: '$categoryInfo.icon',
        totalAmount: 1,
        count: 1,
        percentage: { 
          $multiply: [
            { $divide: ['$totalAmount', totalMonthlyExpenses || 1] }, 
            100
          ] 
        }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
  
  // Get recent transactions
  const recentTransactions = await Transaction.find()
    .populate('category')
    .sort({ date: -1 })
    .limit(5);
  
  // Get total budget for current month
  const budgetSum = await Budget.aggregate([
    {
      $match: {
        month: currentMonth,
        year: currentYear
      }
    },
    {
      $group: {
        _id: null,
        totalBudget: { $sum: '$plannedAmount' }
      }
    }
  ]);
  
  const totalBudget = budgetSum.length > 0 ? budgetSum[0].totalBudget : 0;
  
  // Calculate budget usage
  const budgetUsage = totalBudget > 0 
    ? Math.round((totalMonthlyExpenses / totalBudget) * 100)
    : null;
  
  // Days remaining in month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysRemaining = daysInMonth - currentDate.getDate() + 1;
  
  // Calculate daily budget
  const dailyBudget = totalBudget > 0 
    ? Math.round((totalBudget - totalMonthlyExpenses) / daysRemaining)
    : null;
  
  // Comparison with previous month
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const previousStartDate = new Date(previousYear, previousMonth - 1, 1);
  const previousEndDate = new Date(previousYear, previousMonth, 0);
  
  const previousMonthExpenses = await Transaction.aggregate([
    {
      $match: {
        date: {
          $gte: previousStartDate,
          $lte: previousEndDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
  
  const previousTotalExpenses = previousMonthExpenses.length > 0 
    ? previousMonthExpenses[0].totalAmount 
    : 0;
  
  const expenseChange = previousTotalExpenses > 0
    ? ((totalMonthlyExpenses - previousTotalExpenses) / previousTotalExpenses) * 100
    : null;
  
  res.status(200).json({
    success: true,
    data: {
      currentMonth: moment(startDate).format('MMMM YYYY'),
      summary: {
        totalExpenses: totalMonthlyExpenses,
        transactionCount,
        totalBudget,
        budgetRemaining: totalBudget - totalMonthlyExpenses,
        budgetUsagePercentage: budgetUsage,
        daysRemaining,
        dailyBudget,
        expenseChangeFromLastMonth: expenseChange
      },
      categoryBreakdown,
      recentTransactions
    }
  });
});

/**
 * @desc    Get spending insights
 * @route   GET /api/insights
 * @access  Public
 */
export const getSpendingInsights = asyncHandler(async (req: Request, res: Response) => {
  // Get current date info
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Calculate date ranges
  const startOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfCurrentMonth = new Date(currentYear, currentMonth, 0);
  
  // Last 6 months date range
  const sixMonthsAgo = new Date(currentDate);
  sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
  
  // Top spending categories (last 6 months)
  const topCategories = await Transaction.aggregate([
    {
      $match: {
        date: { $gte: sixMonthsAgo }
      }
    },
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
        count: 1,
        averageTransaction: { $divide: ['$totalAmount', '$count'] }
      }
    },
    { $sort: { totalAmount: -1 } },
    { $limit: 5 }
  ]);
  
  // Monthly spending trend (last 6 months)
  const monthlyTrend = await Transaction.aggregate([
    {
      $match: {
        date: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        totalAmount: 1,
        count: 1,
        monthYear: {
          $concat: [
            { $toString: '$_id.month' },
            '-',
            { $toString: '$_id.year' }
          ]
        }
      }
    },
    { $sort: { year: 1, month: 1 } }
  ]);
  
  // Format monthly trend with month names
  const formattedTrend = monthlyTrend.map((item: any) => ({
    ...item,
    monthName: moment(`${item.year}-${item.month}-01`).format('MMM YYYY')
  }));
  
  // Highest spending day of week
  const dayOfWeekAnalysis = await Transaction.aggregate([
    {
      $match: {
        date: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: { $dayOfWeek: '$date' }, // 1 for Sunday, 2 for Monday, etc.
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        dayOfWeek: '$_id',
        totalAmount: 1,
        count: 1,
        averageAmount: { $divide: ['$totalAmount', '$count'] }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
  
  // Map day numbers to names
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekSpending = dayOfWeekAnalysis.map((day: any) => ({
    ...day,
    dayName: dayNames[day.dayOfWeek - 1]
  }));
  
  // Over-budget categories this month
  const budgetComparison = await Budget.aggregate([
    {
      $match: {
        month: currentMonth,
        year: currentYear
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    { $unwind: '$categoryInfo' }
  ]);
  
  // Get actual spending for this month by category
  const actualSpending = await Transaction.aggregate([
    {
      $match: {
        date: {
          $gte: startOfCurrentMonth,
          $lte: endOfCurrentMonth
        }
      }
    },
    {
      $group: {
        _id: '$category',
        actualAmount: { $sum: '$amount' }
      }
    }
  ]);
  
  // Calculate over-budget categories
  const overBudgetCategories = budgetComparison
    .map((budget: any) => {
      const categorySpending = actualSpending.find((item: any) => 
        item._id.toString() === budget.category.toString()
      );
      
      const actualAmount = categorySpending ? categorySpending.actualAmount : 0;
      const difference = actualAmount - budget.plannedAmount;
      const percentageUsed = Math.round((actualAmount / budget.plannedAmount) * 100);
      
      return {
        category: budget.categoryInfo.name,
        color: budget.categoryInfo.color,
        icon: budget.categoryInfo.icon,
        plannedAmount: budget.plannedAmount,
        actualAmount,
        difference,
        percentageUsed
      };
    })
    .filter((item: any) => item.difference > 0)
    .sort((a: any, b: any) => b.difference - a.difference);
  
  res.status(200).json({
    success: true,
    data: {
      topCategories,
      monthlyTrend: formattedTrend,
      dayOfWeekSpending,
      overBudgetCategories
    }
  });
});