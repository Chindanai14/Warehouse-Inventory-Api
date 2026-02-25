import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
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
  constructor(
    private readonly stockMovementsService: StockMovementsService,
  ) {}

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

  @ApiOperation({ summary: 'ดึงประวัติการเคลื่อนไหว Stock ทั้งหมด' })
  @Get()
  findAll() {
    return this.stockMovementsService.findAll();
  }

  @ApiOperation({ summary: 'ดึงรายงานสรุป Stock IN/OUT (ADMIN เท่านั้น)' })
  @Roles(UserRole.ADMIN)
  @Get('report')
  getReport() {
    return this.stockMovementsService.getReport();
  }

  @ApiOperation({ summary: 'ดึงประวัติ Stock ของสินค้าตาม Product ID' })
  @Get(':productId')
  findByProduct(
    @Param('productId', ParseObjectIdPipe) productId: string,
  ) {
    return this.stockMovementsService.findByProduct(productId);
  }
}