import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from 'src/modules/email/email.service';
import { EmailJob } from 'src/modules/email/types/email.types';

@Processor('email', { concurrency: 5 })
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }
  async process(job: Job<EmailJob>): Promise<any> {
    switch (job.data.type) {
      case 'welcome':
        await this.emailService.sendEmail(
          job.data.data.email,
          'Welcome to Toto Task App',
          'welcome',
          {
            name: job.data.data.email,
          },
        );
        break;
      case 'sendForgotPassowrdToken':
        await this.emailService.sendEmail(
          job.data.data.email,
          'Reset your password',
          'sendForgotPassowrdToken',
          {
            name: job.data.data.email,
            resetPasswordUrl: `${process.env.RENDER_BASE_URL}/api/auth/reset-password?token=${job.data.data.token}`,
            token: job.data.data.token,
            expiresIn: '10',
          },
        );
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
  @OnWorkerEvent('progress')
  onProgress(job: Job<EmailJob>, progress: number) {
    console.log(`Job ${job.id} is ${progress}% complete.`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<EmailJob>) {
    console.log(`Job ${job.id} completed.`);
  }
  @OnWorkerEvent('failed')
  onFailed(job: Job<EmailJob>, error: Error) {
    console.log(`Job ${job.id} failed with error: ${error.message}`);
  }
}
