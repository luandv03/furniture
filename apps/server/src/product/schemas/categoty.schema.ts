import mongoose from 'mongoose';
import { Room } from './room.schema';

export const CategorySchema = new mongoose.Schema(
  {
    title: { type: String, require: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    sumProduct: { type: Number },
  },
  { timestamps: true, collection: 'category' },
);

export class Category extends mongoose.Document {
  title: string;
  roomId: Room;
  sumProduct: number;
}
