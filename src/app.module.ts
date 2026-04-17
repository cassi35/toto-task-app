import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MyLoggerModule } from './my-logger/my-logger.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AtGuard } from './common/guards/auth.guard';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { EmailService } from './modules/email/email.service';
import { EmailModule } from './modules/email/email.module';
import { TokenService } from './modules/token/token.service';
import { TokenModule } from './modules/token/token.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    EmployeesModule,
    ThrottlerModule.forRoot([
      {
        name: 'shor',
        ttl: 1000, // 1 minuto
        limit: 3, // no máximo 10 requisições
      },
      {
        name: 'long',
        ttl: 60000, // 1 hora
        limit: 100, // no máximo 100 requisições'
      },
    ]),
    MyLoggerModule,
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const parsed = envSchema.safeParse(config);
        if (!parsed.success) {
          console.error(
            '❌ Invalid environment variables',
            parsed.error.format(),
          );
          throw new Error('Invalid environment variables.');
        }
        return parsed.data;
      },
    }),

    EmailModule,

    TokenModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    EmailService,
    TokenService,
  ],
})
export class AppModule {}
/* 
Essas dependências servem para proteger sua API contra abusos,
 como ataques de força bruta (brute-force) ou excesso de requisições de um mesmo usuário.
*/
