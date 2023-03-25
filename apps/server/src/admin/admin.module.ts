import { AdminController } from './controllers/admin.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { AdminSchema } from './schema/admin.schema';
import { AdminRepository } from './repositories/admin.repository';
import { AdminService } from './services/admin.service';
import { jwtConstrant } from './constrant/jwt.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Admin',
        schema: AdminSchema,
      },
    ]),
    JwtModule.register({
      secret: jwtConstrant.SECRET_KEY,
      signOptions: { expiresIn: jwtConstrant.EXPIRES_IN },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminRepository, AdminService, JwtService],
  exports: [],
})
export class AdminModule {}
