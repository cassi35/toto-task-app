import { Module } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { OauthController } from './oauth.controller';
import { SocialModule } from '../social/social.module';

@Module({
  providers: [OauthService],
  controllers: [OauthController],
  imports: [SocialModule],
})
export class OauthModule {}
