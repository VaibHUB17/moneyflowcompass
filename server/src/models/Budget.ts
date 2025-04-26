import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from './Category';

export interface IBudget extends Document {
  month: number;
  year: number;
  category: mongoose.Types.ObjectId | ICategory;
  plannedAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema: Schema = new Schema({
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 2000
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  plannedAmount: {
    type: Number,
    required: [true, 'Planned amount is required'],
    min: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of budgets per category per month/year
BudgetSchema.index({ month: 1, year: 1, category: 1 }, { unique: true });

export default mongoose.model<IBudget>('Budget', BudgetSchema);