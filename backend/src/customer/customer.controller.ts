import { Controller, Query,Post, Get, Put, Delete, Param, Body,BadRequestException  } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './schema/customer.schema';
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Create a new customer
  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }
  @Get('/search')
  async searchCustomer(@Query('name') name: string): Promise<Customer[]> {
    if (!name) {
      throw new BadRequestException('Name query parameter is required');
    }
    return this.customerService.searchCustomerByName(name);
  }
  // Get customer by ID
  @Get(':id')
  async getCustomer(@Param('id') id: string) {
    return this.customerService.findById(id);
  }

  // Update customer
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  // Delete customer
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.customerService.delete(id);
  }

  

}
