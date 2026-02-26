import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  sku: string;

  // ✅ FIX B-01: เปลี่ยนจาก String เป็น ObjectId ref ไปยัง Category collection
  // ก่อนหน้านี้เป็นแค่ String ล่องลอย ทำให้ลบ Category แล้วสินค้ายังอ้างชื่อเก่าอยู่
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

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
  supplier: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);