import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailModule } from 'src/modules/email/email.module';
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
    EmailModule,
  ],
})
export class QueueModule {}
