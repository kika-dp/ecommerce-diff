import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const data = await this.auth.register(dto);
    return { message: 'Account created', data };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const data = await this.auth.login(dto);
    return { message: 'Login successful', data };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    const data = await this.auth.refresh(dto);
    return { message: 'Token refreshed', data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@CurrentUser() user: AuthUser) {
    await this.auth.logout(user.id);
    return { message: 'Logged out', data: null };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgot(@Body() dto: ForgotPasswordDto) {
    const data = await this.auth.forgotPassword(dto);
    return { message: 'If the account exists, an OTP was sent', data };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verify(@Body() dto: VerifyOtpDto) {
    const data = await this.auth.verifyOtp(dto);
    return { message: 'OTP verified', data };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async reset(@Body() dto: ResetPasswordDto) {
    const data = await this.auth.resetPassword(dto);
    return { message: 'Password reset successfully', data };
  }
}
