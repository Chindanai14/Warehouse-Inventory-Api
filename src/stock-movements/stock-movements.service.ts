import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import {
  StockMovement, StockMovementDocument, MovementType,
} from './schemas/stock-movement.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectModel(StockMovement.name) private stockMovementModel: Model<StockMovementDocument>,
    @InjectModel(Product.name)       private productModel: Model<ProductDocument>,
    @InjectConnection()              private readonly connection: Connection,
  ) {}

  async stockIn(dto: CreateStockMovementDto): Promise<StockMovement> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const product = await this.productModel.findById(dto.productId).session(session);
      if (!product) throw new NotFoundException(`ไม่พบสินค้า ID: ${dto.productId}`);

      product.currentStock += dto.quantity;
      await product.save({ session });

      const movement = new this.stockMovementModel({
        product:        dto.productId,
        type:           MovementType.IN,
        quantity:       dto.quantity,
        remainingStock: product.currentStock,
        reason:         dto.reason,
        referenceNo:    dto.referenceNo,
        performedBy:    dto.performedBy,
        note:           dto.note,
      });

      const saved = await movement.save({ session });
      await session.commitTransaction();
      return saved;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async stockOut(dto: CreateStockMovementDto): Promise<StockMovement> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const product = await this.productModel.findById(dto.productId).session(session);
      if (!product) throw new NotFoundException(`ไม่พบสินค้า ID: ${dto.productId}`);

      if (product.currentStock < dto.quantity) {
        throw new BadRequestException(
          `Stock ไม่พอ มีอยู่ ${product.currentStock} ชิ้น แต่ต้องการเบิก ${dto.quantity} ชิ้น`,
        );
      }

      product.currentStock -= dto.quantity;
      await product.save({ session });

      const movement = new this.stockMovementModel({
        product:        dto.productId,
        type:           MovementType.OUT,
        quantity:       dto.quantity,
        remainingStock: product.currentStock,
        reason:         dto.reason,
        referenceNo:    dto.referenceNo,
        performedBy:    dto.performedBy,
        note:           dto.note,
      });

      const saved = await movement.save({ session });
      await session.commitTransaction();
      return saved;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ✅ FIX B-09: เพิ่ม Pagination — ไม่ return ทุก record อีกต่อไป
  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.stockMovementModel
        .find()
        .populate('product', 'name sku currentStock')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.stockMovementModel.countDocuments(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ✅ FIX B-11: เพิ่ม Pagination สำหรับประวัติตาม Product
  async findByProduct(productId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException(`ไม่พบสินค้า ID: ${productId}`);

    const [data, total] = await Promise.all([
      this.stockMovementModel
        .find({ product: productId })
        .populate('product', 'name sku')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.stockMovementModel.countDocuments({ product: productId }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ✅ FIX B-10: เพิ่ม date range filter ให้ report มีประโยชน์ทางธุรกิจ
  async getReport(startDate?: string, endDate?: string) {
    const matchStage: Record<string, any> = {};

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate)   matchStage.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    return this.stockMovementModel.aggregate([
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id:           '$type',
          totalQuantity: { $sum: '$quantity' },
          count:         { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}