import { Controller, Post, Body, Session, Get, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsString, MinLength } from 'class-validator';

class LoginDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto, @Session() session: Record<string, any>) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    session.userId = user.id;
    session.username = user.username;
    session.role = user.role;
    return { user };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Session() session: Record<string, any>) {
    session.destroy((err: any) => {
      if (err) {
        throw err;
      }
    });
    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  async getProfile(@Session() session: Record<string, any>) {
    if (!session.userId) {
      return { user: null };
    }
    return { user: { id: session.userId, username: session.username, role: session.role } };
  }
}
