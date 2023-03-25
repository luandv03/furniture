import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../schema/admin.schema';
import { BaseRepository } from 'src/base.repository';

@Injectable()
export class AdminRepository extends BaseRepository<Admin> {
  constructor(@InjectModel('Admin') private readonly adminModel: Model<Admin>) {
    super(adminModel);
  }
}
