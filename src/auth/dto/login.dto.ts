import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  // @ApiProperty จะช่วยบอกให้ Swagger แสดงช่องกรอกข้อมูลตัวอย่าง
  @ApiProperty({ example: 'admin', description: 'ชื่อผู้ใช้งาน (Username)' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123', description: 'รหัสผ่าน (Password)' })
  @IsString()
  @IsNotEmpty()
  password: string;
}