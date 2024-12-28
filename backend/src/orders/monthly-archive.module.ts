import { Module } from '@nestjs/common';
import { MonthlyArchiveService } from './service/monthly-archive.service';
import { MonthlyArchiveController } from './monthly-archive.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MonthlyArchiveSchema } from './schemas/monthly-archive.schema';
import { OrdersModule } from '../orders/orders.module'; // Import OrdersModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'MonthlyArchive', schema: MonthlyArchiveSchema }]),
    OrdersModule, // Import OrdersModule to use OrdersService
  ],
  providers: [MonthlyArchiveService],
  controllers: [MonthlyArchiveController],
})
export class MonthlyArchiveModule {}
