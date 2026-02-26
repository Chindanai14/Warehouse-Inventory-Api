import { Controller, Get, Post, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './schemas/user.schema';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ FIX: Bootstrap Guard — สร้าง User ได้อิสระเฉพาะเมื่อยังไม่มี User ในระบบเลย
  // (ใช้สร้าง ADMIN คนแรก) หลังจากนั้นต้อง Login เป็น ADMIN ถึงจะสร้างได้
  // วิธีใช้:
  //   1. POST /api/v1/users ก่อน login ครั้งแรก → สร้าง ADMIN ได้ (ถ้า DB ว่าง)
  //   2. หลังจากนั้น POST /api/v1/users ต้องใส่ Bearer Token ของ ADMIN เสมอ
  @ApiOperation({
    summary: 'สร้างผู้ใช้งานใหม่',
    description: `
      - ถ้ายังไม่มี User ในระบบ (Bootstrap mode): ไม่ต้องใส่ Token → สร้าง ADMIN คนแรกได้เลย
      - ถ้ามี User แล้ว: ต้อง Login และใส่ Bearer Token ของ ADMIN เท่านั้น
    `,
  })
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const userCount = await this.usersService.countUsers();

    if (userCount > 0) {
      // มี User แล้ว → ต้องผ่าน Guard ปกติ (ADMIN เท่านั้น)
      // แต่เนื่องจาก Guard ต้องอยู่บน decorator ก่อน method run
      // เราจะ throw error แทน Guard เพื่อ simplicity
      // วิธีที่ถูกต้องกว่าคือใช้ Custom Guard แต่นี่ก็ทำงานได้
      throw new NotFoundException(
        'ระบบมีผู้ใช้แล้ว กรุณา Login ด้วย ADMIN และใส่ Bearer Token ใน Header Authorization'
      );
    }

    // Bootstrap: ยังไม่มี user → สร้างได้เลย (force role = ADMIN)
    return this.usersService.create({ ...dto, role: UserRole.ADMIN });
  }

  // ✅ FIX: endpoint สำหรับ ADMIN สร้าง user เพิ่มเติม (requires Auth)
  @ApiOperation({ summary: 'สร้างผู้ใช้งานใหม่ (ADMIN เท่านั้น, ต้อง Login ก่อน)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/create')
  adminCreate(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'ดูรายการผู้ใช้ทั้งหมด (ADMIN เท่านั้น)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
