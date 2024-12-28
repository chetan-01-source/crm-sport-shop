import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Customer } from 'src/customer/schema/customer.schema';
import { Inventory } from 'src/inventory/schema/inventory.schema';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true })
  customer: mongoose.Types.ObjectId; // Reference to Customer document

  @Prop([
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
      quantity: { type: Number, required: true },
    },
  ])
  items: { item: mongoose.Types.ObjectId; quantity: number }[]; // Array of Inventory references and quantities

  @Prop({ required: true })
  totalAmount: number; // Total amount paid by the customer

  @Prop({ required: true })
  totalMarkedPrice: number; // Total marked price (original price of items)

  @Prop({ default: 'pending', enum: ['pending', 'completed', 'cancelled'] })
  status: string; // Order status

  @Prop({ default: false })
  inventoryRestored: boolean; // Indicates if inventory has been restored

  @Prop({ default: new Date() })
  orderDate: Date; // To track when the order was placed
}

export const OrderSchema = SchemaFactory.createForClass(Order);
