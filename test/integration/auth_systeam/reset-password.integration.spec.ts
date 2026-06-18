import * as bcrypt from 'bcrypt';
import { BullModule } from '@nestjs/bullmq';
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
import { userFixtureCreate } from 'test/fixtures/user.fixture';
import TokenNotFoundException from 'src/common/exeptions/auth/token-not-found.exception';
import TokenExpiredException from 'src/common/exeptions/auth/token-expired.exception';
import { CookieService } from 'src/modules/auth/validators/cookie.service';
import { QueueService } from 'src/modules/auth/validators/queue.service';
import { TokenServiceValidator } from 'src/modules/auth/validators/token.service';
import TokenValidatorService from 'src/shared/builders/token.builder';
import { UserValidatorService } from 'src/modules/auth/validators/user.service';
import UserValidatorBuilder from 'src/shared/builders/user.builder';

describe('resetPasswordService (integration)', () => {
  let service: AuthService;
  let db: DatabaseService;
  let tokenService: TokenService;
  let userService: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        CookieService,
        QueueService,
        TokenServiceValidator,
        UserValidatorService,
        UserValidatorBuilder,
        TokenValidatorService,
        { provide: EmailService, useValue: emailServiceMock },
      ],
      imports: [
        MyLoggerModule,
        DatabaseModule,
        UsersModule,
        TokenModule,
        JwtModule.register({ secret: process.env.JWT_SECRET }),
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

  async function createResetTokenForUser(token = 'reset-token-123') {
    const userData = await userFixtureCreate();
    const createdUser = await userService.create(userData);
    const createdToken = await tokenService.create(
      token,
      createdUser.id,
      'RESET' as any,
      new Date(Date.now() + 5 * 60 * 1000),
    );
    return { createdUser, createdToken };
  }

  it('should throw if token not found', async () => {
    await expect(
      service.resetPassoword({
        token: 'missing-token',
        newPassword: 'NovaSenha@2026',
      }),
    ).rejects.toThrow(new TokenNotFoundException());
  });

  it('should throw if token is invalid (mismatch)', async () => {
    await createResetTokenForUser('saved-reset-token');
    await expect(
      service.resetPassoword({
        token: 'different-reset-token',
        newPassword: 'NovaSenha@2026',
      }),
    ).rejects.toThrow(new TokenNotFoundException());
  });

  it('should update password and consume token on success', async () => {
    const { createdUser, createdToken } = await createResetTokenForUser(
      'success-reset-token',
    );
    const oldUser = await userService.findByUserId(createdUser.id);

    const result = await service.resetPassoword({
      token: createdToken.token,
      newPassword: 'NovaSenha@2026',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Password reset successfully');

    const userAfter = await userService.findByUserId(createdUser.id);
    expect(userAfter?.password).toBeDefined();
    expect(userAfter?.password).not.toBe(oldUser?.password);
    const isNewPasswordValid = await bcrypt.compare(
      'NovaSenha@2026',
      userAfter?.password ?? '',
    );
    expect(isNewPasswordValid).toBe(true);

    const tokenAfter = await tokenService.findByToken(createdToken.token);
    expect(tokenAfter).toBeNull();
  });
});
