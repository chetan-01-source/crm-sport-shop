// src/monthly-archive/monthly-archive.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MonthlyArchive } from '../schemas/monthly-archive.schema';
import { Cron } from '@nestjs/schedule';
import { OrdersService } from '../service/orders.service';

@Injectable()
export class MonthlyArchiveService {
  constructor(
    @InjectModel('MonthlyArchive') private readonly archiveModel: Model<MonthlyArchive>,
    private readonly ordersService: OrdersService,
  ) {}
  
  @Cron('0 0 1 * *') // Runs at midnight on the 1st of each month
  async generateMonthlyArchive() {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const month = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    // Calculate the total amount, marked price, and revenue
    const { totalAmount, totalMarkedPrice, revenue } = await this.ordersService.calculateMonthlyStats();

    // Add data to the archive
    await this.addMonthlyData(month, totalAmount, totalMarkedPrice, revenue);
  }

  async addMonthlyData(month: string, totalAmount: number, totalMarkedPrice: number, revenue: number) {
    const archiveCount = await this.archiveModel.countDocuments();
  
    // Add the new monthly data
    await this.archiveModel.create({ month, totalAmount, totalMarkedPrice, revenue });
  
    // Check if there are more than 12 records, and delete the oldest one if necessary
    if (archiveCount >= 12) {
      const oldestRecord = await this.archiveModel
        .findOne()
        .sort({ month: 1 }); // Sort by month ascending
      if (oldestRecord) {
        await this.archiveModel.deleteOne({ _id: oldestRecord._id }); // Use deleteOne
      }
    }
  }

  async getLast12MonthsData(): Promise<MonthlyArchive[]> {
    return this.archiveModel
      .find()
      .sort({ month: -1 }) // Sort by month descending
      .limit(12);
  }
}
