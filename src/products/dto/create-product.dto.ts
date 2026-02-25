import {
  IsString, IsNumber, IsNotEmpty,
  IsOptional, Min, Max, MaxLength,
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

  @ApiProperty({ example: 'เครื่องดื่ม' })
  @IsString()
  @IsNotEmpty({ message: 'หมวดหมู่ห้ามว่าง' })
  @MaxLength(100, { message: 'หมวดหมู่ต้องไม่เกิน 100 ตัวอักษร' })
  category: string;

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
}
