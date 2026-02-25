import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true })
  costPrice: number;

  @Prop({ required: true })
  sellingPrice: number;

  @Prop({ default: 0 })
  minStockLevel: number;

  @Prop({ default: 0 })
  currentStock: number;

  @Prop({ type: Types.ObjectId, ref: 'Supplier', required: false })
  supplier: Types.ObjectId; // ✅ เชื่อมกับ Suppliers
}

export const ProductSchema = SchemaFactory.createForClass(Product);
