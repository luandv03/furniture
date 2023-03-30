import { IsNotEmpty, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { toMongoObjectId } from '../utils/toObjectId.util';

export class RoomCreateDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}

export class RoomIdDto {
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  roomId: Types.ObjectId;
}
