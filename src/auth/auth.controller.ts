import {
  Controller, Post, Body, UnauthorizedException, UseGuards, Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // จำกัด Login 5 ครั้ง/นาที ป้องกัน Brute Force
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'เข้าสู่ระบบ รับ Access + Refresh Token' })
  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) throw new UnauthorizedException('Username หรือ Password ไม่ถูกต้อง');
    return this.authService.login(user);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'ขอ Access Token ใหม่ด้วย Refresh Token' })
  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }

  // ✅ FIX B-06: Logout endpoint — ล้าง refresh token ใน DB ทันที
  @ApiOperation({ summary: 'ออกจากระบบ (ล้าง Refresh Token)' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    // req.user ถูก set โดย JwtStrategy (มี sub = userId)
    await this.authService.logout(req.user.sub);
    return { message: 'Logout สำเร็จ' };
  }
}