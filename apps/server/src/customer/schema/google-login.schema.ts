import mongoose from 'mongoose';

export const GoogleLoginSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: { type: String, required: true },
    google_id: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'google-login',
  },
);

export class GoogleLogin extends mongoose.Document {
  user_id: string;
  email: string;
  google_id: string;
}
