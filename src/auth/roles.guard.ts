import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../users/schemas/user.schema';
import { ROLES_KEY } from './roles.decorator';

/**
 * Guard ตรวจสอบ Role ของผู้ใช้
 * ทำงานร่วมกับ JwtAuthGuard — ต้องใส่ JwtAuthGuard ก่อนเสมอ
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN)
 * @Delete(':id')
 * remove(...) { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ดึง roles ที่กำหนดไว้ใน decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // ถ้าไม่มี @Roles() กำหนดไว้ → เปิดให้ทุก role ผ่าน
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // ดึง user จาก request (ถูก inject โดย JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('ไม่พบข้อมูลผู้ใช้งาน');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `สิทธิ์ไม่เพียงพอ: ต้องการ [${requiredRoles.join(', ')}] แต่คุณเป็น [${user.role}]`,
      );
    }

    return true;
  }
}