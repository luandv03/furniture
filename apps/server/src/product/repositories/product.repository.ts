import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../schemas/product.schema';
import { BaseRepository } from 'src/common/base.repository';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {
    super(productModel);
  }
}
