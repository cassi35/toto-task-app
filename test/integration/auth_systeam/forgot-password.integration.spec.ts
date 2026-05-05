import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { EmailService } from 'src/modules/email/email.service';
import { TokenModule } from 'src/modules/token/token.module';
import { TokenService } from 'src/modules/token/token.service';
import { UsersModule } from 'src/modules/users/users.module';
import { UsersService } from 'src/modules/users/users.service';
import { MyLoggerModule } from 'src/my-logger/my-logger.module';
import { emailServiceMock } from 'test/mock/services/emailService.mock';

describe('forgotPasswordService (integration)', () => {
  let service: AuthService;
  let db: DatabaseService;
  let tokenService: TokenService;
  let userService: UsersService;

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
    tokenService = module.get<TokenService>(TokenService);
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

  it('should create reset token and send email', async () => {
    // arrange — cria usuário via db direto (não precisa do signup aqui)
    const email = 'forgot@mail.com';
    const user = await db.user.create({
      data: { email, password: '123456789', isActive: true },
    });

    // act
    const result = await service.forgotPassword({ email });

    // assert retorno
    expect(result.success).toBe(true);

    // assert persistência real — token criado
    const token = await db.token.findFirst({ where: { userId: user.id } });
    expect(token).not.toBeNull();
    expect(token?.expiresAt.getTime()).toBeGreaterThan(Date.now());

    // assert infra mockada
    expect(emailServiceMock.sendEmail).toHaveBeenCalled();
  });

  it('should throw when email is invalid', async () => {
    await expect(
      service.forgotPassword({ email: 'nao-é-email' }),
    ).rejects.toThrow();
  });

  it('should throw when user does not exist', async () => {
    await expect(
      service.forgotPassword({ email: 'naoexiste@mail.com' }),
    ).rejects.toThrow();
  });

  it('should throw when user already has an active token', async () => {
    // arrange — cria usuário com token já existente
    const email = 'hastoken@mail.com';
    const user = await db.user.create({
      data: { email, password: '123456789', isActive: true },
    });
    await tokenService.create(
      'token-existente',
      user.id,
      'REFRESH' as any,
      new Date(Date.now() + 5 * 60_000),
    );

    await expect(service.forgotPassword({ email })).rejects.toThrow();
  });
});
