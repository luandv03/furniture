import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OtpSchema } from './schema/otp.schema';
import { OtpService } from './service/otp.service';
import { OptRepository } from './repositories/otp.reposiroty';
import { OtpController } from './controller/otp.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Otp',
        schema: OtpSchema,
      },
    ]),
  ],
  controllers: [OtpController],
  providers: [OptRepository, OtpService],
  exports: [OtpService],
})
export class OtpModule {}
