
export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
  category: Category | string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  month: number;
  year: number;
  plannedAmount: number;
  category: Category | string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTransactionSummary {
  category: string;
  color: string;
  icon: string;
  totalAmount: number;
  count: number;
  percentage?: number;
}

export interface MonthlyExpense {
  month: number;
  totalAmount: number;
  count: number;
}

export interface BudgetComparison {
  category: string;
  color: string;
  icon: string;
  plannedAmount: number;
  actualAmount: number;
  difference: number;
  percentageUsed: number;
}

export interface DashboardSummary {
  currentMonth: string;
  summary: {
    totalExpenses: number;
    transactionCount: number;
    totalBudget: number;
    budgetRemaining: number;
    budgetUsagePercentage: number;
    daysRemaining: number;
    dailyBudget: number;
    expenseChangeFromLastMonth: number;
  };
  categoryBreakdown: CategoryTransactionSummary[];
  recentTransactions: Transaction[];
}

export interface SpendingInsights {
  topCategories: CategoryTransactionSummary[] & { averageTransaction: number }[];
  monthlyTrend: {
    year: number;
    month: number;
    totalAmount: number;
    count: number;
    monthYear: string;
    monthName: string;
  }[];
  dayOfWeekSpending: {
    dayOfWeek: number;
    totalAmount: number;
    count: number;
    averageAmount: number;
    dayName: string;
  }[];
  overBudgetCategories: BudgetComparison[];
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  pagination?: {
    current: number;
    limit: number;
    total: number;
    totalRecords: number;
  };
  data: T;
  error?: string;
}

export interface IconMapping {
  [key: string]: string;
}
