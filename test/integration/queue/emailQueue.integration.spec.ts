import * as dotenv from 'dotenv';
dotenv.config();
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { EmailProcessor } from 'src/modules/auth/queue/processors/email.processor';
import { EmailModule } from 'src/modules/email/email.module';
import { EmailService } from 'src/modules/email/email.service';
import { emails } from 'confidentials';

console.log('REDIS URL:', process.env.REDIS);
console.log('BASE URL:', process.env.BASE_URL);
console.log('EMAILS:', emails);
describe('EmailQueue (integration)', () => {
  let app: TestingModule;
  let emailQueue: Queue;
  let emailService: EmailService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.forRoot({
          connection: {
            url: process.env.REDIS,
            tls: {},
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
          },
        }),
        BullModule.registerQueue({
          name: 'email',
        }),
        EmailModule,
      ],

      providers: [EmailProcessor],
    }).compile();
    app = module;
    await app.init(); // <-- isso inicializa o worker
    emailQueue = module.get<Queue>(getQueueToken('email'));
    emailService = module.get<EmailService>(EmailService);
  });

  beforeEach(async () => {
    await emailQueue.drain(true);
    const counts = await emailQueue.getJobCounts();
    console.log('Job counts before test:', counts);
    await emailQueue.obliterate();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await emailQueue.close();
    await app.close(); // <-- fecha o worker também
  });
  describe('should process email concurrency and send welcome', () => {
    it('should send welcome email to multiple users via queue', async () => {
      for (let i = 0; i < emails.length * emails.length; i++) {
        await emailQueue.add(
          'process',
          {
            type: 'welcome',
            data: { email: emails[i % emails.length] },
          },
          {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: true,
          },
        );
      }

      // Aguardar processamento dos jobs
      await new Promise((resolve) => setTimeout(resolve, 3000));
    });
  });
});
