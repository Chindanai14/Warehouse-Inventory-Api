import { IsOptional, IsIn, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class StockMovementQueryDto extends PaginationDto {
  // ✅ FIX: รองรับ filter ตาม type จาก frontend
  @ApiPropertyOptional({ enum: ['IN', 'OUT', 'ADJUST'], description: 'กรอง IN / OUT / ADJUST' })
  @IsOptional()
  @IsIn(['IN', 'OUT', 'ADJUST'], { message: 'type ต้องเป็น IN, OUT หรือ ADJUST' })
  type?: string;

  // ✅ FIX: รองรับ keyword search ชื่อสินค้า / เหตุผล / ผู้ดำเนินการ
  @ApiPropertyOptional({ description: 'ค้นหาชื่อสินค้า, เหตุผล, ผู้ดำเนินการ' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
