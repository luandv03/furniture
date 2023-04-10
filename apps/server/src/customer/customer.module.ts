// packages
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

//entities
import { UserSchema } from './schema/user.schema';
import { EmailLoginSchema } from './schema/email-login.schema';
import { GoogleLoginSchema } from './schema/google-login.schema';
import { TokenVerifyEmailSchema } from './schema/token-verify-email.schema';
import { UserRepository } from './repositories/user.repository';
import { EmailLoginRepository } from './repositories/email-login.repository';
import { GoogleLoginRepository } from './repositories/google-login.repository';
import { TokenVerifyEmailRepository } from './repositories/token-verify-email.repository';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './controllers/customer.controller';
import { jwtConstrant } from 'src/admin/constrant/jwt.config';
import { JwtStrategy } from './strategies/jwt-auth.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
      {
        name: 'EmailLogin',
        schema: EmailLoginSchema,
      },
      {
        name: 'GoogleLogin',
        schema: GoogleLoginSchema,
      },
      {
        name: 'TokenVerifyEmail',
        schema: TokenVerifyEmailSchema,
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
  ],
  controllers: [CustomerController],
  providers: [
    UserRepository,
    EmailLoginRepository,
    GoogleLoginRepository,
    TokenVerifyEmailRepository,
    CustomerService,
    JwtStrategy,
  ],
  exports: [],
})
export class CustomerModule {}
