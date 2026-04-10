// microsoft.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { OauthUser } from 'src/types';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor() {
    super({
      clientID: process.env.CLIENT_ID_AZURE,
      clientSecret: process.env.CLIENT_SECRET_AZURE,
      callbackURL: process.env.MICROSOFT_AUTH_URL,
      scope: ['openid', 'profile', 'email', 'User.Read'],
      tenant: 'common',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<OauthUser> {
    return {
      email: profile.emails?.[0]?.value ?? profile.userPrincipalName ?? '',
      name: profile.displayName ?? '',
      provider: 'AZURE',
      providerId: profile.id,
    };
  }
}
