import { Module } from '@nestjs/common';
import { GoogleService } from './google/google.service';
import { AppleService } from './apple/apple.service';
import { MicrosoftService } from './microsoft/microsoft.service';

@Module({
  providers: [GoogleService, AppleService, MicrosoftService],
  exports: [GoogleService, AppleService, MicrosoftService],
})
export class SocialModule {}
