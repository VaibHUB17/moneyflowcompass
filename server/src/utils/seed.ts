import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category';
import connectDB from '../config/db';

// Load environment variables
dotenv.config();

// Default categories with icons and colors
const defaultCategories = [
  {
    name: 'Groceries',
    icon: 'shopping-cart',
    color: '#4CAF50'
  },
  {
    name: 'Rent',
    icon: 'home',
    color: '#2196F3'
  },
  {
    name: 'Transportation',
    icon: 'car',
    color: '#FF9800'
  },
  {
    name: 'Entertainment',
    icon: 'film',
    color: '#9C27B0'
  },
  {
    name: 'Dining Out',
    icon: 'utensils',
    color: '#F44336'
  },
  {
    name: 'Utilities',
    icon: 'bolt',
    color: '#795548'
  },
  {
    name: 'Healthcare',
    icon: 'heartbeat',
    color: '#E91E63'
  },
  {
    name: 'Education',
    icon: 'graduation-cap',
    color: '#3F51B5'
  },
  {
    name: 'Shopping',
    icon: 'shopping-bag',
    color: '#009688'
  },
  {
    name: 'Travel',
    icon: 'plane',
    color: '#00BCD4'
  },
  {
    name: 'Fitness',
    icon: 'dumbbell',
    color: '#8BC34A'
  },
  {
    name: 'Subscriptions',
    icon: 'credit-card',
    color: '#607D8B'
  },
  {
    name: 'Other',
    icon: 'ellipsis-h',
    color: '#9E9E9E'
  }
];

// Seed function to import default categories
const seedCategories = async () => {
  try {
    await connectDB();
    console.log('Connected to database...');
    
    // Count existing categories
    const count = await Category.countDocuments();
    
    // Only seed if no categories exist
    if (count === 0) {
      console.log('No categories found, seeding default categories...');
      await Category.insertMany(defaultCategories);
      console.log('Default categories seeded successfully!');
    } else {
      console.log(`Database already has ${count} categories, skipping seed.`);
    }
    
    console.log('Seed complete!');
    // process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    // process.exit(1);
  }
};

// Run the seed function if this script is run directly
if (require.main === module) {
  seedCategories();
}

export default seedCategories;