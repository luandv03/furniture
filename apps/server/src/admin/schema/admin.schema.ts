import mongoose from 'mongoose';
import { Role } from '../interfaces/role.enum';

export const AdminSchema = new mongoose.Schema(
  {
    firstname: { type: String, require: true },
    lastname: { type: String, require: true },
    email: { type: String, unique: true, require: true },
    password: { type: String, require: true },
    role: { type: [String], enum: Role, default: Role.POSTER }, //root, admin, poster, saler
    refresh_token: { type: String },
  },
  {
    timestamps: true,
    collection: 'admin',
  },
);

export class Admin extends mongoose.Document {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: Role;
  refreshToken: string;
}
