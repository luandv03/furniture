import mongoose from 'mongoose';

export const TokenVerifyEmailSchema = new mongoose.Schema(
  {
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
    collection: 'token-verify-email',
  },
);

export class TokenVerifyEmail extends mongoose.Document {
  token: string;
  expires: number;
}
