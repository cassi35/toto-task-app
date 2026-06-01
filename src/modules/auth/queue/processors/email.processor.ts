import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from 'src/modules/email/email.service';
import { EmailJob } from 'src/modules/email/types/email.types';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }
  async process(job: Job<EmailJob>): Promise<any> {
    switch (job.data.type) {
      case 'welcome':
        break;
      case 'sendForgotPassowrdToken':
        break;
      case 'sendtoken':
        await this.emailService.sendEmail(
          job.data.data.email,
          'verification token',
          'sendtoken',
          {
            name: job.data.data.email,
            verificationUrl: `${process.env.RENDER_BASE_URL}/api/auth/verify-email?token=${job.data.data.token}`,
            token: job.data.data.token,
            expiresIn: '10',
          },
        );
        break;
    }
  }
}
