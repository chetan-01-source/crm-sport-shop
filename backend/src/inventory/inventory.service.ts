import { Injectable ,BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inventory, InventorySchema } from './schema/inventory.schema';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import * as cron from 'node-cron';
import { NotificationService } from './notification.service';
@Injectable()
export class InventoryService {
  constructor(
    @InjectModel('Inventory') private readonly inventoryModel: Model<Inventory>,
    private notificationService: NotificationService,
  )  {
    // Schedule the low stock check every day at midnight
      cron.schedule('0 */6 * * *', async () => {
        console.log('Running low stock check...');
        await this.checkLowStock(5);
      });
  }

  // Create a new inventory item
  async create(createInventoryDto: CreateInventoryDto) {
    const newInventory = new this.inventoryModel(createInventoryDto);
    return newInventory.save();
  }

  // Get all inventory items
  async findAll() {
    return this.inventoryModel.find().exec();
  }

  // Get inventory item by ID
  async findById(id: string) {
    return this.inventoryModel.findById(id).exec();
  }

  // Update inventory item by ID
  async update(id: string, updateInventoryDto: UpdateInventoryDto) {
    if (!Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ObjectId format');
      }
    return this.inventoryModel.findByIdAndUpdate(id, updateInventoryDto, { new: true });
  }

  // Delete inventory item by ID
  async delete(id: string) {
    return this.inventoryModel.findByIdAndDelete(id).exec();
  }
  async getLowStockItems(threshold: number): Promise<Inventory[]> {
    // Validate threshold if needed
    if (threshold <= 0) {
      throw new BadRequestException('Threshold must be greater than 0');
    }

    // Query to find inventory items where quantity <= threshold
    return this.inventoryModel.find({
      quantity: { $lte: threshold }, // Use threshold in the query
    }).exec();
  }
  async checkLowStock(threshold: number): Promise<void> {
    const lowStockItems = await this.inventoryModel.find({ quantity: { $lte: threshold } }).exec();
    if (lowStockItems.length > 0) {
      const emailContent = `
        <h3>Low Stock Alert</h3>
        <p>The following items have low stock:</p>
        <ul>
          ${lowStockItems.map(item => `<li>${item.name} (Quantity: ${item.quantity})</li>`).join('')}
        </ul>
      `;
      await this.notificationService.sendEmail(
        process.env.OWNER_EMAIL, // Owner's email address
        'Low Stock Alert',
        emailContent,
      );
    } else {
      console.log('No items with low stock.');
    }
  }
  
}
