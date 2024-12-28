import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Module({
  providers: [NotificationService],
  exports: [NotificationService],  // Export the service so it can be used by other modules
})
export class NotificationModule {}
