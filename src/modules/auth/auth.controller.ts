import { Controller, Post, Body, UseGuards, Req, Get, Param, Headers, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(loginDto);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, 
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });

    return { message: 'Login successful' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return this.authService.logout(req.user.id);
  }

  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }

    const tokens = await this.authService.refreshWithToken(refreshToken);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, 
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });

    return { message: 'Token refreshed successfully' };
  }

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    return this.authService.getMe(req.user.id);
  }
}