import mongoose from 'mongoose';

export const EmailLoginSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: { type: String, required: true },
    password: { type: String, required: true },
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
}
