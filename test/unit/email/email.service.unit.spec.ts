import { Test, TestingModule } from '@nestjs/testing';

import '../../../src/config/env';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from 'src/modules/email/email.service';
import { EmailModule } from 'src/modules/email/email.module';

describe('EmailService (Integração)', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }), // Garante que o env seja lido
        EmailModule,
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('deve enviar um email real', async () => {
    const result = await service.sendEmail(
      'sobralcassique@gmail.com',
      'Assunto Teste',
      'welcome',
      {
        name: 'Cassiano',
      },
    );
    expect(result.accepted).toBeDefined();
  }, 30000);
});
