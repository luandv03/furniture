import mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    google_verified: { type: Boolean, default: false }, // Do check user has google account ?
    email_verified: { type: Boolean, default: false }, // Do check user has email account ?
  },
  {
    timestamps: true,
    collection: 'user',
  },
);

export class User extends mongoose.Document {
  email: string;
  name: string;
  google_verified: boolean;
  email_verified: boolean;
}
