import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/common/base.repository';
import { GoogleLogin } from '../schema/google-login.schema';

@Injectable()
export class GoogleLoginRepository extends BaseRepository<GoogleLogin> {
  constructor(
    @InjectModel('GoogleLogin') googleLoginModel: Model<GoogleLogin>,
  ) {
    super(googleLoginModel);
  }
}
