import mongoose from 'mongoose';

export const EmailLoginSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: { type: String, required: true },
    password: { type: String, required: true },
    refresh_token: { type: String },
  },
  {
    timestamps: true,
    collection: 'email-login',
  },
);

export class EmailLogin extends mongoose.Document {
  user_id: string;
  email: string;
  password: string;
  refresh_token: string;
}
