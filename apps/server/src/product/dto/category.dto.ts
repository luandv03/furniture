import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

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
  categoryId: Types.ObjectId;
}
