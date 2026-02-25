import {
  IsString, IsNotEmpty, IsNumber,
  IsEnum, IsOptional, Min, Max, MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MovementType } from '../schemas/stock-movement.schema';

export class CreateStockMovementDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุ Product ID' })
  productId: string;

  // ✅ FIX: Optional เพราะ endpoint /in และ /out กำหนด type เองอยู่แล้ว
  @ApiProperty({ enum: MovementType, required: false })
  @IsOptional()
  @IsEnum(MovementType, { message: 'ประเภทต้องเป็น IN, OUT หรือ ADJUST เท่านั้น' })
  type?: MovementType;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1,      { message: 'จำนวนต้องมากกว่า 0' })
  @Max(999999, { message: 'จำนวนต้องไม่เกิน 999,999' })
  quantity: number;

  @ApiProperty({ example: 'รับสินค้าจาก PO-2024-001' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุเหตุผล' })
  @MaxLength(500)
  reason: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  performedBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
