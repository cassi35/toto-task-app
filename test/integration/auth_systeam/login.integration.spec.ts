import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { EmailModule } from 'src/modules/email/email.module';
import { TokenModule } from 'src/modules/token/token.module';
import { TokenService } from 'src/modules/token/token.service';
import { UsersModule } from 'src/modules/users/users.module';
import { UsersService } from 'src/modules/users/users.service';
import { MyLoggerModule } from 'src/my-logger/my-logger.module';
import { userFixture } from 'test/fixtures/auth';
import { replyMock } from 'test/mock/reply.mock';
import * as bcrypt from 'bcrypt';
import {
  userFixtureCreate,
  userFixtureError,
} from 'test/fixtures/user.fixture';
import InvalidEmailException from 'src/common/exeptions/auth/invalid-email.exception';
import InvalidPasswordException from 'src/common/exeptions/auth/invalid-password.exception';
import UserNotFoundException from 'src/common/exeptions/users/user-not-found.exception';
import UserNotActiveException from 'src/common/exeptions/users/user-not-active.exception';
import InvalidCredentialsException from 'src/common/exeptions/auth/invalid-credentials.exception';
import { BullModule } from '@nestjs/bullmq';
import { CookieService } from 'src/modules/auth/validators/cookie.service';
import { QueueService } from 'src/modules/auth/validators/queue.service';
import { TokenServiceValidator } from 'src/modules/auth/validators/token.service';
import TokenValidatorService from 'src/shared/builders/token.builder';
import { UserValidatorService } from 'src/modules/auth/validators/user.service';
import UserValidatorBuilder from 'src/shared/builders/user.builder';
describe('loginService (integration)', () => {
  let service: AuthService;
  let db: DatabaseService;
  let userService: UsersService;
  let tokenService: TokenService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        CookieService,
        QueueService,
        TokenServiceValidator,
        UserValidatorService,
        UserValidatorBuilder,
        TokenValidatorService,
      ],
      imports: [
        MyLoggerModule,
        DatabaseModule,
        UsersModule,
        TokenModule,
        EmailModule,
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
    userService = module.get<UsersService>(UsersService);
    tokenService = module.get<TokenService>(TokenService);
  });
  beforeEach(async () => {
    await db.token.deleteMany();
    await db.user.deleteMany();
    jest.clearAllMocks();
  });
  afterAll(async () => {
    await db.$disconnect();
  });
  it.skip('should login a user sucecessfully', async () => {
    await service.singup(userFixture);
    const result = await service.login(userFixture, replyMock);
    const user = await userService.finEmail(userFixture.email);
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
  });
  async function createUser(isActive = true) {
    const data = await userFixtureCreate();
    return await userService.create({ ...data, isActive });
  }
  it('should login a user successfully', async () => {
    await createUser();

    const result = await service.login(userFixture, replyMock);

    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(replyMock.setCookie).toHaveBeenCalled();
  });

  it('should throw if email is invalid', async () => {
    const result = service.login(userFixtureError('email'), replyMock);
    await expect(result).rejects.toThrow(new InvalidEmailException());
  });

  it('should throw if password is invalid', async () => {
    const result = service.login(userFixtureError('password'), replyMock);
    await expect(result).rejects.toThrow(new InvalidPasswordException());
  });

  it('should throw if user not found', async () => {
    const result = service.login(userFixture, replyMock);
    await expect(result).rejects.toThrow(new UserNotFoundException());
  });

  it('should throw if user is not active', async () => {
    await createUser(false);
    const result = service.login(userFixture, replyMock);
    await expect(result).rejects.toThrow(new UserNotActiveException());
  });

  it('should throw if credentials are invalid', async () => {
    await createUser();
    const result = service.login(
      { email: userFixture.email, password: '123456788929' },
      replyMock,
    );
    await expect(result).rejects.toThrow(new InvalidCredentialsException());
  });

  it('should set cookie on login', async () => {
    await createUser();
    await service.login(userFixture, replyMock);
    expect(replyMock.setCookie).toHaveBeenCalled();
  });
});
// regra geral
// persistência → real
// regra de negócio → real
// infra externa → mock

/* 
AbordagemQuando usarit individualCasos de erro, 
validações, edge casesFluxo completoHappy path do signup end-to-end
*/
/* 
invalid email
invalid password
user not found
user not active
invalid credentials
success
*/
