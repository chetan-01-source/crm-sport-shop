import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './schema/customer.schema';

@Injectable()
export class CustomerService {
  constructor(@InjectModel('Customer') private readonly customerModel: Model<Customer>) {}

  // Create a new customer
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const createdCustomer = new this.customerModel(createCustomerDto);
    return createdCustomer.save();
  }
  //search by name
  async searchCustomerByName(name: string): Promise<Customer[]> {
    return this.customerModel
      .find({ name: { $regex: new RegExp(name, 'i') } }) // Case-insensitive search
      .exec();
  }
  // Get customer by ID
  async findById(id: string): Promise<Customer> {
    const customer = await this.customerModel.findById(id).populate('orders').exec();
  
    // If no orders are populated, ensure the orders field is an empty array
    if (customer) {
      customer.orders = customer.orders || [];
      return customer;
    }
  
    throw new Error('Customer not found');
  }
  

  // Update an existing customer
  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    return this.customerModel.findByIdAndUpdate(id, updateCustomerDto, { new: true }).exec();
  }

  // Delete a customer
  async delete(id: string): Promise<Customer> {
    return this.customerModel.findByIdAndDelete(id).exec();
  }
}
