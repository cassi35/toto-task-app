import * as bcrypt from 'bcrypt';
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

describe('resetPasswordService (integration)', () => {
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

  it('should reset password and consume token', async () => {
    // arrange — cria usuário e token via services reais
    const email = 'reset@mail.com';
    const user = await db.user.create({
      data: { email, password: 'old-password-123', isActive: true },
    });
    await tokenService.create(
      'reset-token',
      user.id,
      'REFRESH' as any,
      new Date(Date.now() + 5 * 60_000),
    );

    // act
    const result = await service.resetPassoword({
      token: 'reset-token',
      newPassword: 'new-password-123',
    });

    // assert retorno
    expect(result.success).toBe(true);

    // assert persistência real — senha atualizada
    const updatedUser = await userService.findByUserId(user.id);
    const passwordMatches = await bcrypt.compare(
      'new-password-123',
      updatedUser?.password ?? '',
    );
    expect(passwordMatches).toBe(true);

    // assert token consumido
    const consumedToken = await db.token.findFirst({
      where: { userId: user.id },
    });
    expect(consumedToken).toBeNull();
  });

  it('should throw when token does not exist', async () => {
    await expect(
      service.resetPassoword({ token: 'nao-existe', newPassword: '12345678' }),
    ).rejects.toThrow();
  });

  it('should throw when token is expired', async () => {
    const user = await db.user.create({
      data: { email: 'expired@mail.com', password: 'old-pass', isActive: true },
    });
    await tokenService.create(
      'token-expirado',
      user.id,
      'REFRESH' as any,
      new Date(Date.now() - 60_000),
    );

    await expect(
      service.resetPassoword({
        token: 'token-expirado',
        newPassword: '12345678',
      }),
    ).rejects.toThrow();
  });
});
