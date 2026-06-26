import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';

import { MyLoggerModule } from 'src/my-logger/my-logger.module';
import { TokenModule } from '../token/token.module';
import { AtStrategy } from 'src/common/strategies/at.strategy';
import { GoogleStrategy } from './stretegies/google.strategy';
import { MicrosoftStrategy } from './stretegies/microsoft.strategy';
import { OauthController } from './controllers/oauth2.controller';
// import { AtStrategy } from 'src/common/strategies/at.strategy'
import { QueueModule } from './queue/queue.module';

import { TokenService } from '../token/token.service';
import { TokenServiceValidator } from './validators/token.service';
import { CookieService } from './validators/cookie.service';
import { QueueService } from './validators/queue.service';
import UserValidatorBuilder from 'src/shared/builders/user.builder';
import { UserValidatorService } from './validators/user.service';
import TokenValidatorService from 'src/shared/builders/token.builder';
@Module({
  controllers: [AuthController, OauthController],
  providers: [
    AuthService,
    AtStrategy,
    GoogleStrategy,
    MicrosoftStrategy,
    TokenService,
    TokenServiceValidator,
    CookieService,
    QueueService,
    UserValidatorBuilder,
    UserValidatorService,
    TokenValidatorService,
  ],
  imports: [
    MyLoggerModule,
    UsersModule,
    JwtModule.register({}),
    DatabaseModule,
    UsersModule,
    TokenModule,
    QueueModule,
  ],
})
export class AuthModule {}
