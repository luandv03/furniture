import { TokenResetPasswordRepository } from './repositories/token-reset-password.repository';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminSchema } from './schema/admin.schema';
import { TokenResetPasswordSchema } from './schema/token-reset-password.schema';
import { AdminRepository } from './repositories/admin.repository';
import { AdminService } from './services/admin.service';
import { jwtConstrant } from './constrant/jwt.config';
import { AdminController } from './controllers/admin.controller';
import { JwtStrategy } from './strategies/jwt-auth.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Admin',
        schema: AdminSchema,
      },
      {
        name: 'TokenResetPassword',
        schema: TokenResetPasswordSchema,
      },
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'admin',
      session: false,
    }),
    JwtModule.register({
      secret: jwtConstrant.SECRET_KEY,
      signOptions: { expiresIn: jwtConstrant.EXPIRES_IN },
    }),
  ],
  controllers: [AdminController],
  providers: [
    AdminRepository,
    AdminService,
    JwtStrategy,
    TokenResetPasswordRepository,
  ],
  exports: [JwtStrategy],
})
export class AdminModule {}
