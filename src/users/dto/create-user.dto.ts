import { IsString, IsNotEmpty, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ example: 'admin01', description: 'ชื่อผู้ใช้งาน (ต้องไม่ซ้ำ)' })
  @IsString()
  @IsNotEmpty({ message: 'Username ห้ามว่าง' })
  username: string;

  @ApiProperty({ example: 'password123', description: 'รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
  password: string;

  @ApiProperty({ example: 'สมชาย ใจดี', description: 'ชื่อ-นามสกุลผู้ใช้งาน' })
  @IsString()
  @IsNotEmpty({ message: 'ชื่อ-นามสกุลห้ามว่าง' })
  name: string;

  @ApiProperty({
    example: UserRole.STAFF,
    enum: UserRole,
    description: 'บทบาทของผู้ใช้งาน: ADMIN = ผู้ดูแลระบบ, STAFF = พนักงานทั่วไป',
  })
  @IsEnum(UserRole, { message: 'Role ต้องเป็น ADMIN หรือ STAFF เท่านั้น' })
  role: UserRole;
}