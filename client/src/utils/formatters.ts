
import { format, parseISO } from 'date-fns';
import { IconMapping } from '@/types';
import { 
  Home, 
  ShoppingCart, 
  CreditCard, 
  Utensils, 
  Film, 
  User, 
  Users 
} from 'lucide-react';

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Format date for inputs (yyyy-MM-dd)
export const formatDateForInput = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

// Get month name
export const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
};

// Map icon name to component
export const iconMapping: IconMapping = {
  'home': Home,
  'shopping-cart': ShoppingCart,
  'credit-card': CreditCard,
  'utensils': Utensils,
  'film': Film,
  'user': User,
  'users': Users
};

// Get percentage with 1 decimal place
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Get truncated text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
