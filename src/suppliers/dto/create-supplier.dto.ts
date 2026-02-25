import {
  IsString, IsNotEmpty, IsEmail,
  IsOptional, IsBoolean, MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'บริษัท สยามน้ำดี จำกัด' })
  @IsString()
  @IsNotEmpty({ message: 'ชื่อบริษัทห้ามว่าง' })
  @MaxLength(200, { message: 'ชื่อบริษัทต้องไม่เกิน 200 ตัวอักษร' })
  name: string;

  @ApiProperty({ example: 'สมชาย ใจดี' })
  @IsString()
  @IsNotEmpty({ message: 'ชื่อผู้ติดต่อห้ามว่าง' })
  @MaxLength(100, { message: 'ชื่อผู้ติดต่อต้องไม่เกิน 100 ตัวอักษร' })
  contactPerson: string;

  @ApiProperty({ example: 'contact@siamwater.co.th' })
  @IsEmail({}, { message: 'รูปแบบ Email ไม่ถูกต้อง' })
  @MaxLength(150, { message: 'Email ต้องไม่เกิน 150 ตัวอักษร' })
  email: string;

  @ApiProperty({ example: '02-123-4567' })
  @IsString()
  @IsNotEmpty({ message: 'เบอร์โทรห้ามว่าง' })
  @MaxLength(20, { message: 'เบอร์โทรต้องไม่เกิน 20 ตัวอักษร' })
  phone: string;

  @ApiProperty({ example: '123 ถ.สุขุมวิท กรุงเทพ', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'ที่อยู่ต้องไม่เกิน 500 ตัวอักษร' })
  address?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
