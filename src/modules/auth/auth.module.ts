import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';

import { MyLoggerModule } from 'src/my-logger/my-logger.module';
import { EmailModule } from '../email/email.module';
import { TokenModule } from '../token/token.module';
import { AtStrategy } from 'src/common/strategies/at.strategy';
import { GoogleStrategy } from './stretegies/google.strategy';
import { MicrosoftStrategy } from './stretegies/microsoft.strategy';
import { OauthController } from './controllers/oauth2.controller';
// import { AtStrategy } from 'src/common/strategies/at.strategy'
import { QueueModule } from './queue/queue.module';
import { TokenService } from './services/token/token.service';
import { EmailService } from './services/email/email.service';
@Module({
  controllers: [AuthController, OauthController],
  providers: [
    AuthService,
    AtStrategy,
    GoogleStrategy,
    MicrosoftStrategy,
    TokenService,
    EmailService,
  ],
  imports: [
    MyLoggerModule,
    UsersModule,
    JwtModule.register({}),
    DatabaseModule,
    UsersModule,
    EmailModule,
    TokenModule,
    QueueModule,
  ],
})
export class AuthModule {}
