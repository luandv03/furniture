import mongoose from 'mongoose';

export const GoogleLoginSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: { type: String, required: true },
    google_id: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'google',
  },
);

export class GoogleLogin extends mongoose.Document {
  userId: string;
  email: string;
  google_id: string;
}
