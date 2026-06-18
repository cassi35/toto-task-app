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
import { userFixture } from 'test/fixtures/auth';
import { userFixtureCreate } from 'test/fixtures/user.fixture';
import InvalidEmailException from 'src/common/exeptions/auth/invalid-email.exception';
import UserNotFoundException from 'src/common/exeptions/users/user-not-found.exception';
import TokenAlreadyExistsException from 'src/common/exeptions/auth/token-already-exists.excetion';
import { CookieService } from 'src/modules/auth/validators/cookie.service';
import { QueueService } from 'src/modules/auth/validators/queue.service';
import { TokenServiceValidator } from 'src/modules/auth/validators/token.service';
import TokenValidatorService from 'src/shared/builders/token.builder';
import { UserValidatorService } from 'src/modules/auth/validators/user.service';
import UserValidatorBuilder from 'src/shared/builders/user.builder';

describe('forgotPasswordService (integration)', () => {
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

  async function createUser() {
    return await userService.create(await userFixtureCreate());
  }

  it('should throw if email is invalid', async () => {
    await expect(
      service.forgotPassword({
        email: 'invalid-email',
      }),
    ).rejects.toThrow(new InvalidEmailException());
  });

  it('should throw if user not found', async () => {
    await expect(
      service.forgotPassword({
        email: userFixture.email,
      }),
    ).rejects.toThrow(new UserNotFoundException());
  });

  it('should throw if token already exists', async () => {
    const createdUser = await createUser();
    await tokenService.create(
      'active-forgot-token',
      createdUser.id,
      'RESET' as any,
      new Date(Date.now() + 5 * 60 * 1000),
    );

    await expect(
      service.forgotPassword({
        email: userFixture.email,
      }),
    ).rejects.toThrow(new TokenAlreadyExistsException());
  });
});
