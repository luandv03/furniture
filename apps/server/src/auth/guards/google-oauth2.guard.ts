import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuth2Guard extends AuthGuard('google-oauth-20') {}
