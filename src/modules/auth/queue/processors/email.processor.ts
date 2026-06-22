import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from 'src/modules/email/email.service';
import { EmailJob } from 'src/modules/email/types/email.types';
import chalk from 'chalk';
@Processor('email', { concurrency: 3 })
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }
  async process(job: Job<EmailJob>): Promise<any> {
    switch (job.data.type) {
      case 'welcome':
        return await this.emailService.sendEmail(
          job.data.data.email,
          'Welcome to Toto Task App',
          'welcome',
          {
            name: job.data.data.email,
          },
        );
      case 'sendForgotPassowrdToken':
        return await this.emailService.sendEmail(
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
      case 'sendtoken':
        return await this.emailService.sendEmail(
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
      default:
        throw new Error(`Invalid job type: ${job.data.type}`);
    }
  }
  @OnWorkerEvent('progress')
  onProgress(job: Job<EmailJob>) {
    console.log(
      `Job ${job.id} email:${chalk.yellow(job.data.data.email)} ${chalk.blue('progess')}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<EmailJob>) {
    console.log(
      `Job ${job.id} ${chalk.green('completed')}.  email:${chalk.yellow(job.data.data.email)}`,
    );
  }
  @OnWorkerEvent('failed')
  onFailed(job: Job<EmailJob>, error: Error) {
    console.log(
      `Job ${job.id} failed with error: ${chalk.red(error.message)}  email:${chalk.yellow(job.data.data.email)}`,
    );
  }
}
