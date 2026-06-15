import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailModule } from 'src/modules/email/email.module';
import { EmailProcessor } from './processors/email.processor';
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
    EmailModule,
  ],
  providers: [EmailProcessor],
  exports: [BullModule],
})
export class QueueModule {}
