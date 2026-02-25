import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'เครื่องดื่ม' })
  @IsString()
  @IsNotEmpty({ message: 'ชื่อหมวดหมู่ห้ามว่าง' })
  @MaxLength(100, { message: 'ชื่อหมวดหมู่ต้องไม่เกิน 100 ตัวอักษร' })
  name: string;

  @ApiProperty({ example: 'สินค้าประเภทเครื่องดื่มทุกชนิด', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร' })
  description?: string;
}
