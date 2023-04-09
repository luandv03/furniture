import mongoose from 'mongoose';

export const TokenVerifyEmailSchema = new mongoose.Schema(
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
    collection: 'token-verify-email',
  },
);

export class TokenVerifyEmail extends mongoose.Document {
  email: string;
  token: string;
  expires: number;
}
