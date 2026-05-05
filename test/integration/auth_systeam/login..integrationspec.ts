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

describe('loginService (integration)', () => {
  let service: AuthService;
  let db: DatabaseService;
  let tokenService: TokenService;
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

  it('should login successfully with valid credentials', async () => {
    // arrange — usa signup + verifyEmail pra chegar no estado correto
    const email = 'login@mail.com';
    await service.singup({ email, password: userFixture.password });

    const createdUser = await userService.finEmail(email);
    const token = await db.token.findFirst({
      where: { userId: createdUser!.id },
    });
    await service.verifyEmail(token!.token);

    // act
    const reply = replyMock();
    const result = await service.login(
      { email, password: userFixture.password },
      reply,
    );

    // assert retorno
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();

    // assert cookie setado
    expect(reply.setCookie).toHaveBeenCalled();

    // assert usuário ativo no banco
    const loggedUser = await userService.finEmail(email);
    expect(loggedUser?.isActive).toBe(true);
  });

  it('should throw when email is invalid', async () => {
    await expect(
      service.login(
        { email: 'nao-é-email', password: userFixture.password },
        replyMock(),
      ),
    ).rejects.toThrow();
  });

  it('should throw when user is not active', async () => {
    const email = 'inactive@mail.com';
    await service.singup({ email, password: userFixture.password });
    // não verifica email — usuário fica inativo

    await expect(
      service.login({ email, password: userFixture.password }, replyMock()),
    ).rejects.toThrow();
  });

  it('should throw when user does not exist', async () => {
    await expect(
      service.login(
        { email: 'naoexiste@mail.com', password: userFixture.password },
        replyMock(),
      ),
    ).rejects.toThrow();
  });

  it('should throw when password is wrong', async () => {
    const email = 'wrongpass@mail.com';
    await service.singup({ email, password: userFixture.password });

    const createdUser = await userService.finEmail(email);
    const token = await db.token.findFirst({
      where: { userId: createdUser!.id },
    });
    await service.verifyEmail(token!.token);

    await expect(
      service.login({ email, password: 'senha-errada-123' }, replyMock()),
    ).rejects.toThrow();
  });
});
