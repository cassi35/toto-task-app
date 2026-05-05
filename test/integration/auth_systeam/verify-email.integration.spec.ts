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
import { userFixture } from 'test/fixtures/auth';
import { emailServiceMock } from 'test/mock/services/emailService.mock';

describe('verifyEmailService (integration)', () => {
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

  it('should verify user, consume token and send welcome email', async () => {
    // arrange — usa o signup real pra criar o estado
    await service.singup(userFixture);

    const createdUser = await userService.finEmail(userFixture.email);
    const tokenRecord = await db.token.findFirst({
      where: { userId: createdUser!.id },
    });

    // act
    const result = await service.verifyEmail(tokenRecord!.token);

    // assert retorno
    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);

    // assert persistência real — usuário ativo no banco
    const verifiedUser = await userService.finEmail(userFixture.email);
    expect(verifiedUser?.isActive).toBe(true);

    // assert token consumido
    const consumedToken = await db.token.findFirst({
      where: { userId: createdUser!.id },
    });
    expect(consumedToken).toBeNull();

    // assert infra mockada foi chamada
    expect(emailServiceMock.sendEmail).toHaveBeenCalled();
  });

  it('should throw when token does not exist', async () => {
    await expect(service.verifyEmail('token-inexistente')).rejects.toThrow();
  });

  it('should throw when token is expired', async () => {
    // arrange — cria usuário e token expirado direto no banco
    const user = await db.user.create({
      data: { email: 'expired@mail.com', password: 'hash', isActive: false },
    });

    await tokenService.create(
      'token-expirado',
      user.id,
      'REFRESH' as any,
      new Date(Date.now() - 60_000), // já expirou
    );

    await expect(service.verifyEmail('token-expirado')).rejects.toThrow();
  });
});
