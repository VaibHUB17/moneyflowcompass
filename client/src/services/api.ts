
import { ApiResponse, Budget, BudgetComparison, Category, CategoryTransactionSummary, DashboardSummary, MonthlyExpense, SpendingInsights, Transaction } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'API request failed');
  }
  return response.json();
};

// Categories API
export const fetchCategories = async (): Promise<ApiResponse<Category[]>> => {
  const response = await fetch(`${API_URL}/categories`);
  return handleResponse<ApiResponse<Category[]>>(response);
};

export const fetchCategoryById = async (id: string): Promise<ApiResponse<Category>> => {
  const response = await fetch(`${API_URL}/categories/${id}`);
  return handleResponse<ApiResponse<Category>>(response);
};

export const createCategory = async (category: Partial<Category>): Promise<ApiResponse<Category>> => {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category)
  });
  return handleResponse<ApiResponse<Category>>(response);
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<ApiResponse<Category>> => {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category)
  });
  return handleResponse<ApiResponse<Category>>(response);
};

export const deleteCategory = async (id: string): Promise<ApiResponse<{}>> => {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE'
  });
  return handleResponse<ApiResponse<{}>>(response);
};

export const fetchCategoryTransactions = async (startDate?: string, endDate?: string): Promise<ApiResponse<CategoryTransactionSummary[]>> => {
  let url = `${API_URL}/categories/transactions`;
  const params = new URLSearchParams();

  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);
  return handleResponse<ApiResponse<CategoryTransactionSummary[]>>(response);
};

// Transactions API
export const fetchTransactions = async (page = 1, limit = 10, sort = '-date', startDate?: string, endDate?: string, category?: string): Promise<ApiResponse<Transaction[]>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort
  });

  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (category) params.append('category', category);

  const response = await fetch(`${API_URL}/transactions?${params.toString()}`);
  return handleResponse<ApiResponse<Transaction[]>>(response);
};

export const fetchTransactionById = async (id: string): Promise<ApiResponse<Transaction>> => {
  const response = await fetch(`${API_URL}/transactions/${id}`);
  return handleResponse<ApiResponse<Transaction>>(response);
};

export const createTransaction = async (transaction: Partial<Transaction>): Promise<ApiResponse<Transaction>> => {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction)
  });
  return handleResponse<ApiResponse<Transaction>>(response);
};

export const updateTransaction = async (id: string, transaction: Partial<Transaction>): Promise<ApiResponse<Transaction>> => {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction)
  });
  return handleResponse<ApiResponse<Transaction>>(response);
};

export const deleteTransaction = async (id: string): Promise<ApiResponse<{}>> => {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: 'DELETE'
  });
  return handleResponse<ApiResponse<{}>>(response);
};

export const fetchMonthlyExpenses = async (year?: number): Promise<ApiResponse<MonthlyExpense[]>> => {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());

  const response = await fetch(`${API_URL}/transactions/monthly${params.toString() ? `?${params.toString()}` : ''}`);
  return handleResponse<ApiResponse<MonthlyExpense[]>>(response);
};

// Budgets API
export const fetchBudgets = async (month?: number, year?: number, category?: string): Promise<ApiResponse<Budget[]>> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());
  if (category) params.append('category', category);

  const response = await fetch(`${API_URL}/budgets${params.toString() ? `?${params.toString()}` : ''}`);
  return handleResponse<ApiResponse<Budget[]>>(response);
};

export const fetchBudgetById = async (id: string): Promise<ApiResponse<Budget>> => {
  const response = await fetch(`${API_URL}/budgets/${id}`);
  return handleResponse<ApiResponse<Budget>>(response);
};

export const createBudget = async (budget: Partial<Budget>): Promise<ApiResponse<Budget>> => {
  const response = await fetch(`${API_URL}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budget)
  });
  return handleResponse<ApiResponse<Budget>>(response);
};

export const updateBudget = async (id: string, budget: Partial<Budget>): Promise<ApiResponse<Budget>> => {
  const response = await fetch(`${API_URL}/budgets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budget)
  });
  return handleResponse<ApiResponse<Budget>>(response);
};

export const deleteBudget = async (id: string): Promise<ApiResponse<{}>> => {
  const response = await fetch(`${API_URL}/budgets/${id}`, {
    method: 'DELETE'
  });
  return handleResponse<ApiResponse<{}>>(response);
};

export const fetchBudgetComparison = async (month?: number, year?: number): Promise<ApiResponse<BudgetComparison[]>> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());

  const response = await fetch(`${API_URL}/budgets/comparison${params.toString() ? `?${params.toString()}` : ''}`);
  return handleResponse<ApiResponse<BudgetComparison[]>>(response);
};

// Dashboard API
export const fetchDashboardSummary = async (): Promise<ApiResponse<DashboardSummary>> => {
  const response = await fetch(`${API_URL}/dashboard`);
  return handleResponse<ApiResponse<DashboardSummary>>(response);
};

export const fetchSpendingInsights = async (): Promise<ApiResponse<SpendingInsights>> => {
  const response = await fetch(`${API_URL}/dashboard/insights`);
  return handleResponse<ApiResponse<SpendingInsights>>(response);
};
