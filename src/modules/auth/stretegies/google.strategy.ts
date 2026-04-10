import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { OauthUser } from 'src/types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.CLIENT_ID_AUTH,
      clientSecret: process.env.CLIENT_SECRET_AUTH,
      callbackURL: process.env.GOOGLE_AUTH_URL,
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<OauthUser> {
    return {
      email: profile.emails?.[0]?.value ?? '',
      name: profile.displayName,
      provider: 'GOOGLE',
      providerId: profile.id,
    };
  }
}
