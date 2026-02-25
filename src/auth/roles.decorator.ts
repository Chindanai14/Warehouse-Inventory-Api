import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/schemas/user.schema';

export const ROLES_KEY = 'roles';

/**
 * ใช้ตกแต่ง endpoint เพื่อจำกัดสิทธิ์การเข้าถึง
 * @example @Roles(UserRole.ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);