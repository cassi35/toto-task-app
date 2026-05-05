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
import { userFixtureCreate } from 'test/fixtures/user.fixture';

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

  async function createTokenForUser(options?: {
    isActive?: boolean;
    token?: string;
  }) {
    const userData = await userFixtureCreate();
    const createdUser = await userService.create({
      ...userData,
      isActive: options?.isActive ?? false,
    });
    const tokenValue = options?.token ?? 'verify-token-123';
    const createdToken = await tokenService.create(
      tokenValue,
      createdUser.id,
      'VERIFY' as any,
      new Date(Date.now() + 5 * 60 * 1000),
    );
    return { createdUser, createdToken };
  }

  it('should throw if token not found', async () => {
    await expect(service.verifyEmail('token-not-found')).rejects.toThrow(
      'Token not found',
    );
  });

  it('should throw if token expired', async () => {
    const { createdUser } = await createTokenForUser({
      token: 'expired-token',
    });
    await db.token.update({
      where: { token: 'expired-token' },
      data: { expiresAt: new Date(Date.now() - 60 * 1000) },
    });

    await expect(service.verifyEmail('expired-token')).rejects.toThrow(
      'Token expired',
    );

    const userAfter = await userService.findByUserId(createdUser.id);
    expect(userAfter?.isActive).toBe(false);
  });

  it('should throw if token is invalid (mismatch)', async () => {
    await createTokenForUser({ token: 'saved-token' });
    await expect(service.verifyEmail('different-token')).rejects.toThrow(
      'Token not found',
    );
  });

  it('should activate user, consume token and send welcome email on success', async () => {
    const { createdUser, createdToken } = await createTokenForUser({
      token: 'success-verify-token',
      isActive: false,
    });

    const result = await service.verifyEmail(createdToken.token);

    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);

    const userAfter = await userService.findByUserId(createdUser.id);
    expect(userAfter?.isActive).toBe(true);

    const tokenAfter = await tokenService.findByToken(createdToken.token);
    expect(tokenAfter).toBeNull();

    expect(emailServiceMock.sendEmail).toHaveBeenCalledWith(
      userFixture.email,
      'welcome to website',
      'welcome',
      {
        name: userFixture.email,
      },
    );
  });
});
