import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { FastifyRateLimitOptions } from '@fastify/rate-limit';
import { MyLoggerService } from './my-logger/my-logger.service';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { setupSwagger } from './config/Swagger';
import fastifyCookie from '@fastify/cookie';
import fastifyPassport from '@fastify/passport';
import fastifySecureSession from '@fastify/secure-session';
async function bootstrap() {
  // const app = await NestFactory.create(AppModule, {
  //   bufferLogs: true,
  // });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableShutdownHooks();
  // Ordem importa: cookie → session → passport
  await app.register(fastifyCookie as any, {
    secret: process.env.JWT_SECRET,
    hook: 'onRequest',
    parseOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  });

  await app.register(fastifySecureSession as any, {
    secret: process.env.JWT_SECRET!.padEnd(32, '_').slice(0, 32), // precisa de exatamente 32 chars
    salt: 'mq9hDxBVDbspDR6n',
    cookie: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  });

  await app.register(fastifyPassport.initialize() as any);
  await app.register(fastifyPassport.secureSession() as any);

  // 1. Configurar Prefixo primeiro
  app.setGlobalPrefix('api');
  // 2. Registrar Plugins com cast de tipo para evitar o erro que você postou

  await app.register(fastifyStatic as any, {
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  // 3. Configurações Globais
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: process.env.FRONTEND_URL_DEV,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove campos que não estão no DTO
      forbidNonWhitelisted: true, // Dá erro se enviarem campos extras
      transform: true, // Transforma o JSON na instância da classe DTO
    }),
  );
  // 4. Swagger (Depois do prefixo, antes do listen)
  setupSwagger(app);
  app.useLogger(app.get(MyLoggerService));
  await app.listen(process.env.PORT ?? 8000, '0.0.0.0'); //port
}
bootstrap().catch((err) => {
  console.error(err);
});
