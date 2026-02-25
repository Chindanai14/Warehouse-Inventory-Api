import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { StockMovement, StockMovementDocument, MovementType } from './schemas/stock-movement.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectModel(StockMovement.name) private stockMovementModel: Model<StockMovementDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectConnection() private readonly connection: Connection,
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
        product: dto.productId,
        type: MovementType.IN,
        quantity: dto.quantity,
        remainingStock: product.currentStock,
        reason: dto.reason,
        referenceNo: dto.referenceNo,
        performedBy: dto.performedBy,
        note: dto.note,
      });

      const savedMovement = await movement.save({ session }); 
      await session.commitTransaction(); 
      return savedMovement;
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
        throw new BadRequestException(`Stock ไม่พอ มีอยู่ ${product.currentStock} ชิ้น แต่ต้องการเบิก ${dto.quantity} ชิ้น`);
      }

      product.currentStock -= dto.quantity;
      await product.save({ session });

      const movement = new this.stockMovementModel({
        product: dto.productId,
        type: MovementType.OUT,
        quantity: dto.quantity,
        remainingStock: product.currentStock,
        reason: dto.reason,
        referenceNo: dto.referenceNo,
        performedBy: dto.performedBy,
        note: dto.note,
      });

      const savedMovement = await movement.save({ session });
      await session.commitTransaction();
      return savedMovement;
    } catch (error) {
      await session.abortTransaction(); 
      throw error;
    } finally {
      session.endSession(); 
    }
  }

  async findAll(): Promise<StockMovement[]> {
    return this.stockMovementModel.find().populate('product', 'name sku currentStock').sort({ createdAt: -1 }).exec();
  }

  async findByProduct(productId: string): Promise<StockMovement[]> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException(`ไม่พบสินค้า ID: ${productId}`);
    return this.stockMovementModel.find({ product: productId }).populate('product', 'name sku').sort({ createdAt: -1 }).exec();
  }

  async getReport() {
    return this.stockMovementModel.aggregate([
      { $group: { _id: '$type', totalQuantity: { $sum: '$quantity' }, count: { $sum: 1 } } }
    ]);
  }
}