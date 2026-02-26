import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'หน้าที่ต้องการดึงข้อมูล (เริ่มจาก 1)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'จำนวนรายการต่อหน้า (สูงสุด 500)',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500) // ✅ แก้ไขขีดจำกัดสูงสุดจาก 100 เป็น 500 เพื่อรองรับ Frontend
  limit?: number = 10;
}