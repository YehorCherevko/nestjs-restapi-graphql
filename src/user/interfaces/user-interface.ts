import { UserRole } from "../enums/user-roles";
import { Document } from "mongoose";

export interface IUser extends Document {
  nickname: string;
  firstName: string;
  lastName: string;
  password: string;
  salt: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  role: UserRole;
  lastVotedAt: Date | null;
  rating: number;
}

export interface JwtUser extends Partial<IUser> {
  userId: string;
  nickname: string;
  role: UserRole;
  rating: number;
}
