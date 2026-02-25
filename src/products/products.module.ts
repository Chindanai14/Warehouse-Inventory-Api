import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';
// ✅ FIX: เพิ่ม StockMovement เพื่อให้ ProductsService เช็คก่อนลบ
import { StockMovement, StockMovementSchema } from '../stock-movements/schemas/stock-movement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name,        schema: ProductSchema        },
      { name: StockMovement.name,  schema: StockMovementSchema  },
    ]),
  ],
  controllers: [ProductsController],
  providers:   [ProductsService],
})
export class ProductsModule {}
