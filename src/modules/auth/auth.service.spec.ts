import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { SignupDto } from './dto/signup.dto';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { TokenModule } from '../token/token.module';
import { EmailModule } from '../email/email.module';
import { MyLoggerModule } from 'src/my-logger/my-logger.module';

describe('AuthService', () => {
  let service: AuthService;
  let db: DatabaseService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
      imports: [
        MyLoggerModule,
        DatabaseModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET,
        }),
        UsersModule,
        TokenModule,
        EmailModule,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    db = module.get<DatabaseService>(DatabaseService);
  });
  afterAll(async () => {
    await db.$disconnect();
  });
  it('should veiry if exists token in database and send email and send token in suignup', async () => {
    const user: SignupDto = {
      email: 'sobralcassique@gmail.com',
      password: '123456879',
    };
    const signup = await service.singup(user);
    expect(signup.success).toBe(true);
    console.log(signup);
  }, 30000);
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
