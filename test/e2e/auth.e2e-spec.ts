import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { GoogleAuthGuard } from 'src/modules/auth/guards/google.guard';
import { MicrosoftGuard } from 'src/modules/auth/guards/microsoft.guard';
import { EmailService } from 'src/modules/email/email.service';

import request from 'supertest';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import AuthRouter from 'src/common/routes/auth.routes';
import { userFixture } from 'test/fixtures/auth';
import { UsersService } from 'src/modules/users/users.service';
import { emailMockService } from 'test/mock/auth.mock';
import { AllExceptionsFilter } from 'src/all-exceptions.filter';
import fastifyCookie from '@fastify/cookie';
import { TokenService } from 'src/modules/token/token.service';
describe('Auth System (e2e)', () => {
  let app: NestFastifyApplication;
  let userService: UsersService;
  let db: DatabaseService;
  let tokenService: TokenService;
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(emailMockService)
      .overrideGuard(GoogleAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(MicrosoftGuard)
      .useValue({ canActivate: () => true })
      .compile();
    userService = moduleFixture.get<UsersService>(UsersService);
    tokenService = moduleFixture.get<TokenService>(TokenService);
    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.register(fastifyCookie as any, {
      secret: process.env.JWT_SECRET,
      hook: 'onRequest',
      parseOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    });
    app.useGlobalFilters(new AllExceptionsFilter());
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
  async function signupUser(data = userFixture) {
    return await request(app.getHttpServer())
      .post(`/${AuthRouter.BASE}/${AuthRouter.SIGNUP}`)
      .send(data);
  }
  async function loginUser(data = userFixture) {
    return await request(app.getHttpServer())
      .post(`/${AuthRouter.BASE}/${AuthRouter.LOGIN}`)
      .send(data);
  }
  async function logoutUser() {
    return await request(app.getHttpServer()).post(
      `/${AuthRouter.BASE}/${AuthRouter.LOGOUT}`,
    );
  }
  async function isActive() {
    const user = await userService.finEmail(userFixture.email);
    user!.isActive = true;
    return await userService.update(user!.id, user!);
  }
  describe.skip('post /auth/signup', () => {
    it.skip('should create a new user and send email', async () => {
      const res = await signupUser();
      const user = await userService.finEmail(userFixture.email);
      expect(user).toBeDefined();
      expect(user?.email).toBe(userFixture.email);
      expect(res.status).toBe(201);
    });

    it.skip('should return 409 if user already exists (prisma filter)', async () => {
      // cria primeiro usuário
      await signupUser();
      // tenta criar duplicado
      const res = await signupUser();

      expect(res.status).toBe(409); // vindo do PrismaExceptionFilter
      expect(res.body.message).toBeDefined();
      console.log(res.body);
    });
  });
  describe.skip('post login /auth/login', () => {
    it('SHOULD login a user', async () => {
      // signup
      await signupUser();
      // active
      await isActive();
      //login
      const res = await loginUser();
      const cookies = res.headers['set-cookie'];
      const response = res.body;
      expect(cookies).not.toBeNull();
      expect(res.headers['content-type']).toContain('application/json');
      expect(cookies[0]).toContain('access_token');
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      console.log(process.env.JWT_SECRET);
      console.log(cookies);
      console.log(response);
    });
  });
  describe.skip('should logout /auth/login', () => {
    it('should logout user', async () => {
      await signupUser();
      await isActive();
      const login = await loginUser();
      const cookieLogin = login.headers['set-cookie'];
      const res = await logoutUser();
      const cookies = res.headers['set-cookie'];
      const response = res.body;
      // expect(cookies).not.toBeNull();
      // expect(cookies[0]).not.toContain('access_token');
      // expect(response.success).toBe(true);
      console.log(cookies);
      console.log(response);
      console.log(cookieLogin);
    });
    it.skip('should throw if cookie doest exists', async () => {
      await signupUser();
      await isActive();
      const res = await logoutUser();
      const cookies = res.headers['set-cookie'];
      const response = res.body;
      console.log(cookies);
      console.log(response);
    });
  });
  describe.skip('should forgot password /auth/forgot-password', () => {
    it('should reset password', async () => {});
  });
  describe.skip('should reset password /auth/reset-password', () => {});
  describe.skip('should login oaoth /auth/oauth', () => {});
  describe('should get user info /auth/me', () => {
    it('should return user info', async () => {
      await signupUser();
      await isActive();
      const login = await loginUser();
      const cookies = login.headers['set-cookie'];
      console.log(cookies);
      const me = await request(app.getHttpServer())
        .get(`/${AuthRouter.BASE}/${AuthRouter.ME}`)
        .set('Cookie', cookies);
      console.log(`aqui deveria retornar o body`, me.body);
    });
  });
});
//um it testa um comportamento observável
/* 
e2e valida:

status
body
headers
cookies
validação (via erro/sucesso)
*/
/* 
login
sucesso
erro de credenciais
usuário inexistente
usuário inativo
validação de input
cookie
estrutura da resposta
segurança básica (rate limit)
Isso fecha o login em nível e2e.
*/
