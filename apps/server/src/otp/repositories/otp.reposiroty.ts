import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/common/base.repository';
import { Otp } from '../schema/otp.schema';

@Injectable()
export class OptRepository extends BaseRepository<Otp> {
  constructor(
    @InjectModel('Otp')
    OtpModel: Model<Otp>,
  ) {
    super(OtpModel);
  }
}
