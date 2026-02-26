import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
// ✅ FIX B-02: import Product เพื่อเช็คก่อนลบ Supplier
import { Product } from '../products/schemas/product.schema';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
    // ✅ FIX B-02: inject productModel
    @InjectModel(Product.name)  private productModel:  Model<any>,
  ) {}

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = new this.supplierModel(dto);
    return supplier.save();
  }

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.supplierModel.find().skip(skip).limit(limit).exec(),
      this.supplierModel.countDocuments(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierModel.findById(id).exec();
    if (!supplier) throw new NotFoundException(`ไม่พบ Supplier ID: ${id}`);
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.supplierModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!supplier) throw new NotFoundException(`ไม่พบ Supplier ID: ${id}`);
    return supplier;
  }

  async remove(id: string): Promise<{ message: string }> {
    // ✅ FIX B-02: เช็คก่อนลบว่ามีสินค้าที่อ้างอิง Supplier นี้อยู่ไหม
    const productCount = await this.productModel.countDocuments({ supplier: id });
    if (productCount > 0) {
      throw new BadRequestException(
        `ไม่สามารถลบ Supplier นี้ได้ เนื่องจากมีสินค้า ${productCount} รายการที่ใช้ Supplier นี้อยู่`,
      );
    }

    const supplier = await this.supplierModel.findByIdAndDelete(id).exec();
    if (!supplier) throw new NotFoundException(`ไม่พบ Supplier ID: ${id}`);
    return { message: 'ลบ Supplier สำเร็จ' };
  }
}