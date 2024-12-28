import { Controller, Post,Query,BadGatewayException,BadRequestException, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Types } from 'mongoose';
import { Inventory } from './schema/inventory.schema';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Create a new inventory item
  @Post()
  async create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }
  @Get('low-stock')
  async getLowStockItems(
    @Query('threshold') threshold: number, // Retrieve the threshold from query params
  ): Promise<Inventory[]> {
    if (!threshold || threshold <= 0) {
      throw new BadRequestException('A valid threshold value must be provided');
    }

    return this.inventoryService.getLowStockItems(threshold); // Pass threshold to service
  }

  // Get all inventory items
  @Get()
  async findAll() {
    return this.inventoryService.findAll();
  }

  // Get inventory item by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.inventoryService.findById(id);
  }

  // Update inventory item by ID
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId format');
    }
    return this.inventoryService.update(id, updateInventoryDto);
  }

  // Delete inventory item by ID
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.inventoryService.delete(id);
  }

}
