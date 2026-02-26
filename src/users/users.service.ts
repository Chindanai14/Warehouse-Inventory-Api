import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({ username: dto.username });
    if (existingUser) throw new ConflictException('Username นี้มีในระบบแล้ว');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const createdUser = new this.userModel({ ...dto, password: hashedPassword });
    const savedUser   = await createdUser.save();
    const userObj     = savedUser.toObject();
    delete (userObj as any).password;
    delete (userObj as any).refreshToken; // ไม่ส่งกลับ
    return userObj;
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findAll() {
    return this.userModel.find().select('-password -refreshToken').exec();
  }

  // ✅ FIX B-06: บันทึก / ล้าง refresh token ใน DB
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const hashed = refreshToken
      ? await bcrypt.hash(refreshToken, 10) // hash ก่อนบันทึก — ไม่เก็บ plain text
      : null;
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashed }).exec();
  }

  // ✅ FIX B-06: ตรวจสอบ refresh token ว่าตรงกับที่บันทึกไว้ไหม
  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();
    if (!user?.refreshToken) return false;
    return bcrypt.compare(refreshToken, user.refreshToken);
  }
}