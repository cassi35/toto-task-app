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
import { OauthUser } from 'src/types';
import { replyMock } from 'test/mock/reply.mock';

describe('oauthService (integration)', () => {
  let service: AuthService;
  let db: DatabaseService;
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

  const oauthFixture: OauthUser = {
    email: 'oauth-user@gmail.com',
    name: 'OAuth User',
    provider: 'GOOGLE',
    providerId: 'google-user-1',
  };

  it('should create user on first oauth login and send welcome email', async () => {
    const result = await service.loginOauth(oauthFixture, replyMock);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Login successful');
    expect(result.token).toBeDefined();
    expect(result.verified).toBe(true);
    expect(replyMock.setCookie).toHaveBeenCalled();
    expect(emailServiceMock.sendEmail).toHaveBeenCalledWith(
      oauthFixture.email,
      'welcome to website',
      'welcome',
      { name: oauthFixture.email },
    );

    const savedUser = await userService.finEmail(oauthFixture.email);
    expect(savedUser).toBeDefined();
    expect(savedUser?.provider).toBe('GOOGLE');
    expect(savedUser?.providerId).toBe(oauthFixture.providerId);
  });

  it('should throw when user creation fails', async () => {
    const usersServiceEdgeMock = {
      finEmail: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),
      create: jest.fn().mockResolvedValue(undefined),
    };
    const edgeModule: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceEdgeMock },
        { provide: EmailService, useValue: emailServiceMock },
      ],
      imports: [
        MyLoggerModule,
        DatabaseModule,
        TokenModule,
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
    }).compile();
    const edgeService = edgeModule.get<AuthService>(AuthService);

    await expect(edgeService.loginOauth(oauthFixture, replyMock)).rejects.toThrow(
      'User creation failed',
    );
  });

  it('should login existing oauth user and set cookie', async () => {
    await userService.create({
      email: oauthFixture.email,
      createdAt: new Date(),
      isActive: true,
      provider: oauthFixture.provider,
      providerId: oauthFixture.providerId,
    });

    const result = await service.loginOauth(oauthFixture, replyMock);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Login successful');
    expect(result.token).toBeDefined();
    expect(replyMock.setCookie).toHaveBeenCalled();
    expect(emailServiceMock.sendEmail).not.toHaveBeenCalled();
  });
});
