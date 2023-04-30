// packages
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

//entities
import { EmailLoginSchema } from './schema/email-login.schema';
import { GoogleLoginSchema } from './schema/google-login.schema';
import { EmailLoginRepository } from './repositories/email-login.repository';
import { GoogleLoginRepository } from './repositories/google-login.repository';
import { CustomerController } from './controllers/auth.controller';
import { jwtConstrant } from 'src/admin/constrant/jwt.config';
import { JwtStrategy } from './strategies/jwt-auth.strategy';
import { GoogleOAuth20Strategy } from './strategies/google-oauth2.strategy';
import { EmailAuthService } from './services/email-auth.service';
import { GoogleAuthService } from './services/google-auth.servcie';
import { AuthService } from './services/auth.service';
import { OtpModule } from 'src/otp/otp.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: 'EmailLogin',
        schema: EmailLoginSchema,
      },
      {
        name: 'GoogleLogin',
        schema: GoogleLoginSchema,
      },
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: jwtConstrant.SECRET_KEY,
      signOptions: { expiresIn: jwtConstrant.EXPIRES_IN },
    }),
    OtpModule,
    UserModule,
  ],
  controllers: [CustomerController],
  providers: [
    ConfigService,
    EmailLoginRepository,
    GoogleLoginRepository,
    AuthService,
    EmailAuthService,
    GoogleAuthService,
    JwtStrategy,
    GoogleOAuth20Strategy,
  ],
  exports: [],
})
export class AuthModule {}
