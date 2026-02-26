import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';

@ApiTags('Stock Movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @ApiOperation({ summary: 'รับสินค้าเข้าคลัง (ADMIN และ STAFF)' })
  @Post('in')
  stockIn(@Body() dto: CreateStockMovementDto) {
    return this.stockMovementsService.stockIn(dto);
  }

  @ApiOperation({ summary: 'เบิกสินค้าออกจากคลัง (ADMIN และ STAFF)' })
  @Post('out')
  stockOut(@Body() dto: CreateStockMovementDto) {
    return this.stockMovementsService.stockOut(dto);
  }

  // ✅ FIX B-09: รับ pagination query params
  @ApiOperation({ summary: 'ดึงประวัติการเคลื่อนไหว Stock ทั้งหมด (พร้อม Pagination)' })
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.stockMovementsService.findAll(pagination);
  }

  // ✅ FIX B-10: รับ startDate / endDate สำหรับ filter รายงาน
  @ApiOperation({ summary: 'รายงานสรุป Stock IN/OUT (ADMIN เท่านั้น)' })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate',   required: false, example: '2025-12-31' })
  @Roles(UserRole.ADMIN)
  @Get('report')
  getReport(
    @Query('startDate') startDate?: string,
    @Query('endDate')   endDate?: string,
  ) {
    return this.stockMovementsService.getReport(startDate, endDate);
  }

  // ✅ FIX B-11: รับ pagination สำหรับประวัติ product
  @ApiOperation({ summary: 'ดึงประวัติ Stock ของสินค้าตาม Product ID (พร้อม Pagination)' })
  @Get(':productId')
  findByProduct(
    @Param('productId', ParseObjectIdPipe) productId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.stockMovementsService.findByProduct(productId, pagination);
  }
}