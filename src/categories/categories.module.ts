import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category, CategorySchema } from './schemas/category.schema';
// ✅ FIX B-03: เพิ่ม Product เพื่อให้ CategoriesService เช็คก่อนลบได้
import { Product, ProductSchema } from '../products/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Product.name,  schema: ProductSchema  }, // ✅ เพิ่ม
    ]),
  ],
  controllers: [CategoriesController],
  providers:   [CategoriesService],
})
export class CategoriesModule {}