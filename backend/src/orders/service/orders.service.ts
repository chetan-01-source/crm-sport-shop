import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../schemas/order.schema';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { Customer } from 'src/customer/schema/customer.schema';
import { Inventory } from 'src/inventory/schema/inventory.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>, 
    @InjectModel('Customer') private readonly customerModel: Model<Customer>, 
    @InjectModel('Inventory') private readonly inventoryModel: Model<Inventory>, 
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { customerId, items, totalAmount, status } = createOrderDto;

    // Fetch the customer to check if they exist
    const customer = await this.customerModel.findById(customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    let totalMarkedPrice = 0; // Initialize the total marked price

    // Process the items, calculate the total marked price, and update the inventory
    const processedItems = await Promise.all(
      items.map(async ({ itemId, quantity }) => {
        const inventoryItem = await this.inventoryModel.findById(itemId);
        if (!inventoryItem) {
          throw new NotFoundException(`Item with ID ${itemId} not found`);
        }

        // Check for sufficient stock
        if (inventoryItem.quantity < quantity) {
          throw new BadRequestException(
            `Insufficient stock for item: ${inventoryItem.name} (ID: ${itemId})`,
          );
        }

        // Deduct the quantity from the inventory
        inventoryItem.quantity -= quantity;
        await inventoryItem.save();

        // Calculate the total marked price for this item and add it to the total
        totalMarkedPrice += inventoryItem.price * quantity;

        return { item: inventoryItem._id, quantity }; // Return processed item
      }),
    );

    // Create a new order with the calculated total marked price
    const newOrder = new this.orderModel({
      customer: customer._id,
      items: processedItems,
      totalAmount,
      totalMarkedPrice, // Store the total marked price
      status: status || 'pending',
    });

    const savedOrder = await newOrder.save();

    // Link the order to the customer
    customer.orders.push(savedOrder.id);
    await customer.save();

    return savedOrder;
  }
  async getAllOrders(): Promise<Order[]> {
    return this.orderModel.find().populate('customer items.item');
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).populate('customer items.item');
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      id,
      { $set: updateOrderDto },
      { new: true },
    ).populate('customer items.item');

    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }

    return updatedOrder;
  }

  async deleteOrder(id: string): Promise<{ message: string }> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await Promise.all(
      order.items.map(async ({ item, quantity }) => {
        const inventoryItem = await this.inventoryModel.findById(item);
        if (inventoryItem) {
          inventoryItem.quantity += quantity;
          await inventoryItem.save();
        }
      }),
    );

    await this.orderModel.deleteOne({ _id: id });

    return { message: 'Order deleted and inventory restored' };
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId).populate('items.item');

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException('Order is already cancelled');
    }

    if (!order.inventoryRestored) {
      await Promise.all(
        order.items.map(async ({ item, quantity }) => {
          const inventoryItem = await this.inventoryModel.findById(item._id);

          if (!inventoryItem) {
            throw new NotFoundException(`Inventory item with ID ${item._id} not found`);
          }

          inventoryItem.quantity += quantity; 
          await inventoryItem.save();
        }),
      );

      order.inventoryRestored = true;
    }

    order.status = 'cancelled';
    return order.save();
  }

  // New method to calculate total amount and total marked price for monthly orders
  async calculateMonthlyStats(): Promise<{ totalAmount: number; totalMarkedPrice: number,revenue:number }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(startOfMonth.getMonth() + 1);

    const monthlyOrders = await this.orderModel.find({
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    });

    const totalAmount = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalMarkedPrice = monthlyOrders.reduce(
      (sum, order) => sum + order.totalMarkedPrice,
      0,
    );
    const revenue=totalAmount-totalMarkedPrice;
    return { totalAmount, totalMarkedPrice ,revenue};
  }
}
