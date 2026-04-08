import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  providers: [TokenService],
  exports: [TokenService],
  imports: [DatabaseModule],
})
export class TokenModule {}
