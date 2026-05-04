import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { GoogleAuthGuard } from 'src/modules/auth/guards/google.guard';
import { MicrosoftGuard } from 'src/modules/auth/guards/microsoft.guard';
import { EmailService } from 'src/modules/email/email.service';
import { TokenService } from 'src/modules/token/token.service';
import { App } from 'supertest/types';
import request from 'supertest';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import AuthRouter from 'src/common/routes/auth.routes';
import { userFixture } from 'test/fixtures/auth';
import { UsersService } from 'src/modules/users/users.service';
describe('Auth System (e2e)', () => {
  let app: NestFastifyApplication;
  let userService: UsersService;
  let db: DatabaseService;
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue({ sendEmail: jest.fn() })
      .overrideGuard(GoogleAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(MicrosoftGuard)
      .useValue({ canActivate: () => true })
      .compile();
    userService = moduleFixture.get<UsersService>(UsersService);
    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    db = moduleFixture.get<DatabaseService>(DatabaseService);
  });
  beforeEach(async () => {
    await db.token.deleteMany();
    await db.user.deleteMany();
  });
  afterAll(async () => {
    if (db) await db.$disconnect();
    if (app) await app.close();
  });
  describe('post /auth/signup', () => {
    it('should create a new user', async () => {
      const res = await request(app.getHttpServer())
        .post(`/${AuthRouter.BASE}/${AuthRouter.SIGNUP}`)
        .send(userFixture);
      const user = await userService.finEmail(userFixture.email);
      console.log(
        `should create with testscontainer ${process.env.DATABASE_URL}`,
      );
      expect(user?.email).toBe(userFixture.email);
      console.log(user);
      expect(res.status).toBe(201);
    });
  });
});
