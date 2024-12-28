import { Schema, Document } from 'mongoose';

export interface Inventory extends Document {
  name: string;
  category: string;
  price: number;
  quantity: number;
  lowStockThreshold: number; // New property
}

export const InventorySchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    lowStockThreshold: { type: Number, default: 5 }, // Default threshold is 5
  },
  {
    timestamps: true,
  },
);
