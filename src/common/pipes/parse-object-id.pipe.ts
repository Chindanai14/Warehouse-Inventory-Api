import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(
        `ID: "${value}" ไม่ใช่ ObjectId ที่ถูกต้อง`,
      );
    }
    return value;
  }
}
