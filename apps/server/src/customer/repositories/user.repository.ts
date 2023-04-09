import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/common/base.repository';
import { User } from '../schema/user.schema';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel('User') userModel: Model<User>) {
    super(userModel);
  }
}
