import mongoose from 'mongoose';

export const RoomSchema = new mongoose.Schema(
  {
    title: { type: String, require: true, trim: true },
  },
  {
    timestamps: true,
    collection: 'room',
  },
);

export class Room extends mongoose.Document {
  title: string;
}
