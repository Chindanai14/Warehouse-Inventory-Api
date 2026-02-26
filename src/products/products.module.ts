import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { StockMovement, StockMovementSchema } from '../stock-movements/schemas/stock-movement.schema';
// ✅ FIX B-01: import Category เพื่อให้ service validate categoryId ได้
import { Category, CategorySchema } from '../categories/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name,        schema: ProductSchema        },
      { name: StockMovement.name,  schema: StockMovementSchema  },
      { name: Category.name,       schema: CategorySchema       }, // ✅ เพิ่ม
    ]),
  ],
  controllers: [ProductsController],
  providers:   [ProductsService],
})
export class ProductsModule {}