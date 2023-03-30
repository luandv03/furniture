import { BaseRepository } from 'src/base.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Room } from '../schemas/room.schema';

@Injectable()
export class RoomRepository extends BaseRepository<Room> {
  constructor(@InjectModel('Room') private readonly roomModel: Model<Room>) {
    super(roomModel);
  }
}
