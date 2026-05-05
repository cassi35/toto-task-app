import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { EmailService } from 'src/modules/email/email.service';
import { TokenModule } from 'src/modules/token/token.module';
import { UsersModule } from 'src/modules/users/users.module';
import { UsersService } from 'src/modules/users/users.service';
import { MyLoggerModule } from 'src/my-logger/my-logger.module';
import { emailServiceMock } from 'test/mock/services/emailService.mock';

describe('oauthService (integration)', () => {
  let service: AuthService;
  let db: DatabaseService;
  let userService: UsersService;

  const replyMock = () =>
    ({
      setCookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
    }) as any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: EmailService, useValue: emailServiceMock },
      ],
      imports: [
        MyLoggerModule,
        DatabaseModule,
        UsersModule,
        TokenModule,
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    db = module.get<DatabaseService>(DatabaseService);
    userService = module.get<UsersService>(UsersService);
  });

  beforeEach(async () => {
    await db.token.deleteMany();
    await db.user.deleteMany();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it('should create user on first oauth login and send welcome email', async () => {
    const reply = replyMock();
    const email = 'oauth-new@mail.com';

    const result = await service.loginOauth(
      {
        email,
        name: 'OAuth User',
        provider: 'GOOGLE',
        providerId: 'google-123',
      },
      reply,
    );

    // assert retorno
    expect(result.success).toBe(true);

    // assert persistência real — usuário criado e ativo
    const createdUser = await userService.finEmail(email);
    expect(createdUser).not.toBeNull();
    expect(createdUser?.isActive).toBe(true);
    expect(createdUser?.provider).toBe('GOOGLE');

    // assert infra
    expect(reply.setCookie).toHaveBeenCalled();
    expect(emailServiceMock.sendEmail).toHaveBeenCalled();
  });

  it('should login existing oauth user without creating another user', async () => {
    const reply = replyMock();
    const email = 'oauth-existing@mail.com';

    // arrange — cria usuário existente direto no banco
    await db.user.create({
      data: {
        email,
        provider: 'GOOGLE',
        providerId: 'google-seed',
        isActive: true,
      },
    });

    const result = await service.loginOauth(
      {
        email,
        name: 'OAuth Existing',
        provider: 'GOOGLE',
        providerId: 'google-seed',
      },
      reply,
    );

    // assert retorno
    expect(result.success).toBe(true);

    // assert não duplicou usuário
    const users = await db.user.findMany({ where: { email } });
    expect(users).toHaveLength(1);

    // assert cookie setado mas email NÃO enviado (usuário já existia)
    expect(reply.setCookie).toHaveBeenCalled();
    expect(emailServiceMock.sendEmail).not.toHaveBeenCalled();
  });
});
