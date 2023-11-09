import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { UserRole } from "src/user/enums/user-roles";

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  nickname: string;

  @Prop({ required: true, unique: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  salt: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;

  @Prop({ default: null })
  deleted_at: Date | null;

  @Prop({
    enum: [UserRole.User, UserRole.Moderator, UserRole.Admin],
    default: UserRole.User,
  })
  role: UserRole;

  @Prop({ default: 0 })
  rating: number;

  @Prop()
  lastVotedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
