import { TokenResetPassword } from '../schema/token-reset-password.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/base.repository';

@Injectable()
export class TokenResetPasswordRepository extends BaseRepository<TokenResetPassword> {
  constructor(
    @InjectModel('TokenResetPassword')
    private readonly tokenResetPasswordModel: Model<TokenResetPassword>,
  ) {
    super(tokenResetPasswordModel);
  }
}
