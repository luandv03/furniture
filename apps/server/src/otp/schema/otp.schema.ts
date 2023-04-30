import mongoose from 'mongoose';

export const OtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expires: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'otp',
  },
);

export class Otp extends mongoose.Document {
  email: string;
  token: string;
  expires: number;
}
