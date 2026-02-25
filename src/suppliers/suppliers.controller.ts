import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';

@ApiTags('Suppliers')         // ✅ หมวดหมู่ใน Swagger
@ApiBearerAuth()              // ✅ ต้องใส่ Token
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @ApiOperation({ summary: 'สร้าง Supplier ใหม่ (ADMIN เท่านั้น)' })
  @Roles(UserRole.ADMIN)      // 🔒 เฉพาะ ADMIN
  @Post()
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @ApiOperation({ summary: 'ดึงรายการ Supplier ทั้งหมด (พร้อม Pagination)' })
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.suppliersService.findAll(pagination);
  }

  @ApiOperation({ summary: 'ดึงข้อมูล Supplier ตาม ID' })
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.suppliersService.findOne(id);
  }

  @ApiOperation({ summary: 'แก้ไขข้อมูล Supplier (ADMIN เท่านั้น)' })
  @Roles(UserRole.ADMIN)      // 🔒 เฉพาะ ADMIN
  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, dto);
  }

  @ApiOperation({ summary: 'ลบ Supplier (ADMIN เท่านั้น)' })
  @Roles(UserRole.ADMIN)      // 🔒 เฉพาะ ADMIN
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.suppliersService.remove(id);
  }
}