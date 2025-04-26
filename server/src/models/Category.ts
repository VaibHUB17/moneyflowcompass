import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  icon: {
    type: String,
    default: 'tag'
  },
  color: {
    type: String,
    default: '#808080'
  }
}, {
  timestamps: true
});

export default mongoose.model<ICategory>('Category', CategorySchema);