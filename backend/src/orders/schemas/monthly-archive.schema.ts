// src/monthly-archive/schema/monthly-archive.schema.ts
import { Schema, Document } from 'mongoose';

export const MonthlyArchiveSchema = new Schema({
  month: { type: String, required: true, unique: true }, // e.g., "2024-12"
  totalAmount: { type: Number, required: true },
  totalMarkedPrice: { type: Number, required: true },
  revenue: { type: Number, required: true },
});

export interface MonthlyArchive extends Document {
  month: string;
  totalAmount: number;
  totalMarkedPrice: number;
  revenue: number;
}
