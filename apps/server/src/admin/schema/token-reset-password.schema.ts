import mongoose from 'mongoose';

export const TokenResetPasswordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'admin',
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
    collection: 'token-reset-password',
  },
);

export class TokenResetPassword extends mongoose.Document {
  userId: string;
  token: string;
  _id: string;
  expires: number;
}
