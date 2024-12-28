import { Schema, Document, Types } from 'mongoose';

// Customer schema definition
export const CustomerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    address: { type: String, required: false },
    orders: [
      {
        type: Types.ObjectId,
        ref: 'Order', // Reference to the Order schema
        required: false, // Orders can be empty initially
      },
    ],
  },
  { timestamps: true }, // Optionally add timestamps
);

// Customer interface to define the types of the fields in the schema
export interface Customer extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  orders: Types.ObjectId[]; // An array of ObjectIds referencing orders
}
