import { Test, TestingModule } from '@nestjs/testing';
import { EmailModule } from './email.module'; // Importa o seu módulo pronto
import { EmailService } from './email.service';
import '../config/env'; // Certifique-se de carregar as variáveis de ambiente aqui
import { ConfigModule } from '@nestjs/config';

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
