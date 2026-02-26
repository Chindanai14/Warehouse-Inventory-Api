import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.STAFF })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  // ✅ ระบุ type: String ตรงๆ เพื่อป้องกัน CannotDetermineTypeError
  @Prop({ type: String, default: null })
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);