import { Controller, Get, Param } from '@nestjs/common';
import { MonthlyArchiveService } from './service/monthly-archive.service';

@Controller('monthly-archives')
export class MonthlyArchiveController {
  constructor(private readonly archiveService: MonthlyArchiveService) {}

  // Endpoint to get the last 12 months' data
  @Get()
  async getLast12Months() {
    return this.archiveService.getLast12MonthsData();
  }

  // Endpoint to get data for a specific month
  @Get(':month')
  async getArchiveByMonth(@Param('month') month: string) {
    const data = await this.archiveService.getLast12MonthsData();
    return data.find((archive) => archive.month === month);
  }
}
