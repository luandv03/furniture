import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IGoogleOAuth2Payload } from '../interfaces/google-oauth2-payload.interface';

@Injectable()
export class GoogleOAuth20Strategy extends PassportStrategy(
  Strategy,
  'google-oauth-20',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_OAUTH2_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_OAUTH2_SECRET_KEY'),
      callbackURL: configService.get('GOOGLE_OAUTH2_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string, // accessToken được sử dụng để gọi để google API để truy xuất các dữ liệu khác
    refreshToken: string, // chẳng hặn như Google Sheet,...
    profile: Profile,
  ): Promise<IGoogleOAuth2Payload | any> {
    const { emails, displayName } = profile;

    return {
      email: emails && emails[0].value, // emails is possible undefined
      name: displayName,
    };
  }
}
