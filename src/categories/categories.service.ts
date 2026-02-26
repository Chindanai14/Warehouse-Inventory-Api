import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
// ✅ FIX B-03: import Product เพื่อเช็คก่อนลบ Category
import { Product } from '../products/schemas/product.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    // ✅ FIX B-03: inject productModel
    @InjectModel(Product.name)  private productModel:  Model<any>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = new this.categoryModel(dto);
    return category.save();
  }

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.categoryModel.find().skip(skip).limit(limit).exec(),
      this.categoryModel.countDocuments(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!category) throw new NotFoundException(`ไม่พบหมวดหมู่ ID: ${id}`);
    return category;
  }

  async remove(id: string): Promise<{ message: string }> {
    // ✅ FIX B-03: เช็คก่อนลบว่ามีสินค้าในหมวดหมู่นี้อยู่ไหม
    // หมายเหตุ: ทำงานได้ถูกต้องก็ต่อเมื่อแก้ B-01 แล้ว (category เป็น ObjectId ref)
    const productCount = await this.productModel.countDocuments({ category: id });
    if (productCount > 0) {
      throw new BadRequestException(
        `ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีสินค้า ${productCount} รายการอยู่ในหมวดหมู่นี้`,
      );
    }

    const category = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!category) throw new NotFoundException(`ไม่พบหมวดหมู่ ID: ${id}`);
    return { message: 'ลบหมวดหมู่สำเร็จ' };
  }
}