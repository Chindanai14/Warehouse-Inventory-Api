import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// PartialType ทำให้ทุก field เป็น optional อัตโนมัติ
export class UpdateProductDto extends PartialType(CreateProductDto) {}
