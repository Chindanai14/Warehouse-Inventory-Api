import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StockMovementDocument = StockMovement & Document;

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST',
}

@Schema({ timestamps: true })
export class StockMovement {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true, enum: MovementType })
  type: MovementType;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  remainingStock: number;

  @Prop({ required: true })
  reason: string;

  @Prop()
  referenceNo: string;

  @Prop()
  performedBy: string;

  @Prop()
  note: string;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
