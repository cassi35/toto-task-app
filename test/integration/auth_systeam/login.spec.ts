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
import { emailServiceMock } from 'test/mock/services/emailService.mock';
describe('loginService (integration)', () => {
  let service: AuthService;
  let db: DatabaseService;
  let userService: UsersService;
  let tokenService: TokenService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: EmailService, useValue: emailServiceMock },
      ],
      imports: [
        DatabaseModule,
        UsersModule,
        TokenModule,
        JwtModule.register({ secret: process.env.JWT_SECRET }),
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
});
