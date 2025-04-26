import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from './Category';

export interface ITransaction extends Document {
  amount: number;
  date: Date;
  description: string;
  category: mongoose.Types.ObjectId | ICategory;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  }
}, {
  timestamps: true
});

// Index for faster queries
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ category: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);