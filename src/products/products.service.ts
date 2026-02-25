import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

// ✅ Import StockMovement เพื่อเช็คก่อนลบ
import { StockMovement } from '../stock-movements/schemas/stock-movement.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)        private productModel: Model<ProductDocument>,
    @InjectModel(StockMovement.name)  private stockMovementModel: Model<any>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = new this.productModel(dto);
    return product.save();
  }

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productModel
        .find()
        .populate('supplier', 'name contactPerson phone')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException(`ไม่พบสินค้า ID: ${id}`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    // ✅ FIX: ป้องกันการแก้ currentStock โดยตรงผ่าน PATCH (ต้องผ่าน StockMovement เท่านั้น)
    const { currentStock, ...safeDto } = dto as any;

    const product = await this.productModel
      .findByIdAndUpdate(id, safeDto, { new: true })
      .exec();
    if (!product) throw new NotFoundException(`ไม่พบสินค้า ID: ${id}`);
    return product;
  }

  async remove(id: string): Promise<{ message: string }> {
    // ✅ FIX: เช็คก่อนลบว่ามีประวัติ StockMovement ผูกอยู่ไหม
    const movementCount = await this.stockMovementModel.countDocuments({ product: id });
    if (movementCount > 0) {
      throw new BadRequestException(
        `ไม่สามารถลบสินค้านี้ได้ เนื่องจากมีประวัติการเคลื่อนไหวสต๊อก ${movementCount} รายการ`,
      );
    }

    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) throw new NotFoundException(`ไม่พบสินค้า ID: ${id}`);
    return { message: 'ลบสินค้าสำเร็จ' };
  }

  async findLowStock(): Promise<Product[]> {
    return this.productModel
      .find({ $expr: { $lte: ['$currentStock', '$minStockLevel'] } })
      .populate('supplier', 'name contactPerson phone')
      .exec();
  }
}
