import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { EmailModule } from 'src/modules/email/email.module';
import { EmailService } from 'src/modules/email/email.service';
import { TokenModule } from 'src/modules/token/token.module';
import { TokenService } from 'src/modules/token/token.service';
import { UsersModule } from 'src/modules/users/users.module';
import { UsersService } from 'src/modules/users/users.service';
import { MyLoggerModule } from 'src/my-logger/my-logger.module';
import { userFixture } from 'test/fixtures/auth';
import { emailServiceMock } from 'test/mock/services/emailService.mock';
import { tokenServiceMock } from 'test/mock/services/tokenService.mock';
import { CookieService } from 'src/modules/auth/validators/cookie.service';
import { QueueService } from 'src/modules/auth/validators/queue.service';
import { TokenServiceValidator } from 'src/modules/auth/validators/token.service';
import TokenValidatorService from 'src/shared/builders/token.builder';
import { UserValidatorService } from 'src/modules/auth/validators/user.service';
import UserValidatorBuilder from 'src/shared/builders/user.builder';
describe('signupService (integration)', () => {
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
        { provide: EmailService, useValue: emailServiceMock },
        { provide: TokenService, useValue: tokenServiceMock },
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
  it.skip('should signup a user sucecessfully', async () => {
    const result = await service.singup(userFixture);
    const userId = await userService.finEmail(userFixture.email);
    console.log(result);
    console.log(process.env.DATABASE_URL);
    expect(result.statusCode).toBe(201);
    expect(userId?.email).toBe(userFixture.email);
    expect(emailServiceMock.sendEmail).toHaveBeenCalled();
    expect(tokenServiceMock.create).toHaveBeenCalled();
  });
  it.skip('should thwrow if emai already exists', async () => {
    await service.singup(userFixture);
    await expect(service.singup(userFixture)).rejects.toThrow(); //tenta duplicar
  });
  it('should throw if email is invalid', async () => {
    await expect(
      service.singup({ email: '1232mail.com', password: '12323123' }),
    ).rejects.toThrow();
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
