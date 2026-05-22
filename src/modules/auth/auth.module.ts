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
// import { AtStrategy } from 'src/common/strategies/at.strategy'
@Module({
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, GoogleStrategy, MicrosoftStrategy],
  imports: [
    MyLoggerModule,
    UsersModule,
    JwtModule.register({}),
    DatabaseModule,
    UsersModule,
    EmailModule,
    TokenModule,
  ],
})
export class AuthModule {}
