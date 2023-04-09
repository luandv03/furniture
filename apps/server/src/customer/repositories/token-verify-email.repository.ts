import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/common/base.repository';
import { TokenVerifyEmail } from '../schema/token-verify-email.schema';

@Injectable()
export class TokenVerifyEmailRepository extends BaseRepository<TokenVerifyEmail> {
  constructor(
    @InjectModel('TokenVerifyEmail')
    tokenVerifyEmailModel: Model<TokenVerifyEmail>,
  ) {
    super(tokenVerifyEmailModel);
  }
}
