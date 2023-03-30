import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../schemas/categoty.schema';
import { BaseRepository } from 'src/base.repository';

@Injectable()
export class CategoryRepository extends BaseRepository<Category> {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
  ) {
    super(categoryModel);
  }
}
