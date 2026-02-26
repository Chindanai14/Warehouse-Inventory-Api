import {
  IsString, IsNumber, IsNotEmpty,
  IsOptional, Min, Max, MaxLength, Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'น้ำดื่มมิเนอรัล 600ml' })
  @IsString()
  @IsNotEmpty({ message: 'ชื่อสินค้าห้ามว่าง' })
  @MaxLength(200, { message: 'ชื่อสินค้าต้องไม่เกิน 200 ตัวอักษร' })
  name: string;

  @ApiProperty({ example: 'WTR-600-001' })
  @IsString()
  @IsNotEmpty({ message: 'SKU ห้ามว่าง' })
  @MaxLength(50, { message: 'SKU ต้องไม่เกิน 50 ตัวอักษร' })
  sku: string;

  // ✅ FIX B-01 + B-04: รับ categoryId เป็น ObjectId string และ validate รูปแบบ
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ObjectId ของ Category' })
  @IsString()
  @IsNotEmpty({ message: 'หมวดหมู่ห้ามว่าง' })
  @Matches(/^[a-f\d]{24}$/i, { message: 'categoryId ต้องเป็น MongoDB ObjectId ที่ถูกต้อง' })
  category: string; // ส่งเป็น string แต่ Mongoose จะ cast เป็น ObjectId ให้อัตโนมัติ

  @ApiProperty({ example: 'ขวด' })
  @IsString()
  @IsNotEmpty({ message: 'หน่วยนับห้ามว่าง' })
  @MaxLength(50, { message: 'หน่วยนับต้องไม่เกิน 50 ตัวอักษร' })
  unit: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0,       { message: 'ราคาทุนต้องมากกว่าหรือเท่ากับ 0' })
  @Max(9999999, { message: 'ราคาทุนสูงเกินไป' })
  costPrice: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0,       { message: 'ราคาขายต้องมากกว่าหรือเท่ากับ 0' })
  @Max(9999999, { message: 'ราคาขายสูงเกินไป' })
  sellingPrice: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999, { message: 'สต๊อกขั้นต่ำสูงเกินไป' })
  minStockLevel?: number;

  // ✅ FIX B-04: validate supplierObjectId รูปแบบ ObjectId
  @ApiProperty({ example: '507f1f77bcf86cd799439011', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[a-f\d]{24}$/i, { message: 'supplier ต้องเป็น MongoDB ObjectId ที่ถูกต้อง' })
  supplier?: string;
}