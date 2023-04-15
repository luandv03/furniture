import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { BaseRepository } from 'src/common/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel('User') userModel: Model<User>) {
    super(userModel);
  }
}
