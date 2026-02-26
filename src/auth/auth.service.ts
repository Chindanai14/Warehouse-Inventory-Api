import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService:    JwtService,
    private configService: ConfigService,
    private usersService:  UsersService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return { userId: user._id, username: user.username, role: user.role };
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret:    this.configService.get<string>('JWT_REFRESH_SECRET') || 'default_refresh_secret',
      expiresIn: parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '604800', 10),
    });

    // ✅ FIX B-06: บันทึก refresh token (hashed) ลง DB ทันทีที่ login
    await this.usersService.updateRefreshToken(user.userId.toString(), refreshToken);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default_refresh_secret',
      });

      const user = await this.usersService.findByUsername(payload.username);
      if (!user) throw new UnauthorizedException('User not found');

      // ✅ FIX B-06: ตรวจสอบว่า refresh token ตรงกับที่บันทึกไว้ใน DB
      // ถ้า logout ไปแล้ว refreshToken ใน DB จะเป็น null → ใช้ไม่ได้
      const isValid = await this.usersService.validateRefreshToken(
        (user as any)._id.toString(),
        token,
      );
      if (!isValid) throw new UnauthorizedException('Refresh token ถูก revoke แล้ว กรุณา login ใหม่');

      const newPayload = { username: user.username, sub: (user as any)._id, role: user.role };
      const newAccessToken = this.jwtService.sign(newPayload);

      return { access_token: newAccessToken };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Refresh token ไม่ถูกต้องหรือหมดอายุ');
    }
  }

  // ✅ FIX B-06: logout → ล้าง refresh token ใน DB ทำให้ใช้ไม่ได้ทันที
  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }
}