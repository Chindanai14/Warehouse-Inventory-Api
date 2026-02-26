import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';
// ✅ FIX B-02: เพิ่ม Product เพื่อให้ SuppliersService เช็คก่อนลบได้
import { Product, ProductSchema } from '../products/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
      { name: Product.name,  schema: ProductSchema  }, // ✅ เพิ่ม
    ]),
  ],
  controllers: [SuppliersController],
  providers:   [SuppliersService],
  exports:     [SuppliersService],
})
export class SuppliersModule {}