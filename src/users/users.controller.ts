import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'; // ✅ 1. Import จาก swagger เพิ่ม
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './schemas/user.schema';

@ApiTags('Users')      // ✅ 2. จัดหมวดหมู่ให้ Swagger ดูสวยงาม
@ApiBearerAuth()       // ✅ 3. สำคัญมาก! สั่งให้ Swagger แนบ Token มาด้วยเวลาเรียก API ของ Users
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ FIX: ล็อคด้วย JWT + ADMIN role เท่านั้นถึงสร้าง user ได้
  // หมายเหตุ: สร้าง ADMIN คนแรกผ่าน seed script หรือ MongoDB Compass โดยตรง
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) 
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) 
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}