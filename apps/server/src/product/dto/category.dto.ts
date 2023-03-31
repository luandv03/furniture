import { IsNotEmpty, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { toMongoObjectId } from '../utils/toObjectId.util';

export class CategoryCreateDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  roomId: string;
}

export class CategoryIdDto {
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  categoryId: Types.ObjectId;
}
