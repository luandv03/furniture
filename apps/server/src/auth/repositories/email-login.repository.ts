import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/common/base.repository';
import { EmailLogin } from '../schema/email-login.schema';

@Injectable()
export class EmailLoginRepository extends BaseRepository<EmailLogin> {
  constructor(@InjectModel('EmailLogin') emailLoginModel: Model<EmailLogin>) {
    super(emailLoginModel);
  }
}
