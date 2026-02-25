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

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  // ✅ FIX: เพิ่ม Refresh Token logic
  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default_refresh_secret',
      });

      // ดึง user ล่าสุดจาก DB เผื่อ role เปลี่ยน
      const user = await this.usersService.findByUsername(payload.username);
      if (!user) throw new UnauthorizedException('User not found');

      const newPayload = { username: user.username, sub: user._id, role: user.role };
      const newAccessToken = this.jwtService.sign(newPayload);

      return { access_token: newAccessToken };
    } catch {
      throw new UnauthorizedException('Refresh token ไม่ถูกต้องหรือหมดอายุ');
    }
  }
}
