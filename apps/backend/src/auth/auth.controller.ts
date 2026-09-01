import { Controller, Post, Body, Session, Get, HttpCode, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;
}

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Session() session: Record<string, any>) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    session.userId = user.id;
    session.username = user.username;
    session.role = user.role;
    return { user };
  }

  @Get('csrf-token')
  @ApiOperation({ summary: 'Get CSRF token for state-changing requests' })
  @ApiResponse({ status: 200, description: 'CSRF token returned' })
  getCsrfToken(@Req() req: any) {
    return { csrfToken: req.csrfToken() };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Logout and destroy session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Session() session: Record<string, any>) {
    if (!session) {
      return { message: 'Logged out successfully' };
    }

    await new Promise<void>((resolve, reject) => {
      session.destroy((err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  async getProfile(@Session() session: Record<string, any>) {
    if (!session.userId) {
      return { user: null };
    }
    return { user: { id: session.userId, username: session.username, role: session.role } };
  }
}
