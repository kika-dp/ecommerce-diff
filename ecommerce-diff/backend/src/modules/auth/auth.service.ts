import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import { Role } from '../../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../../common/enums/user-status.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.users.create({
      email: dto.email,
      fullName: dto.fullName,
      mobile: dto.mobile,
      password: dto.password,
      role: Role.USER,
    });
    const tokens = await this.issueTokens(user);
    return { user: this.serialize(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Account banned');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.issueTokens(user);
    return { user: this.serialize(user), ...tokens };
  }

  async refresh(dto: RefreshDto) {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(dto.refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.users.findById(payload.sub);
    if (!user.refreshTokenHash) throw new UnauthorizedException('Session revoked');
    const ok = await bcrypt.compare(dto.refreshToken, user.refreshTokenHash);
    if (!ok) throw new UnauthorizedException('Invalid refresh token');
    const tokens = await this.issueTokens(user);
    return { user: this.serialize(user), ...tokens };
  }

  async logout(userId: string) {
    await this.users.setRefreshTokenHash(userId, null);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) return { sent: true };
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.users.setOtp(user.id, otp, expiresAt);
    // In production, deliver via email service. Logged for dev visibility.
    this.logger.log(`OTP for ${user.email} -> ${otp}`);
    return { sent: true, devOtp: this.config.get('app.env') === 'development' ? otp : undefined };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.assertValidOtp(dto.email, dto.otp);
    return { verified: true, userId: user.id };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.assertValidOtp(dto.email, dto.otp);
    await this.users.updatePassword(user.id, dto.newPassword);
    await this.users.setOtp(user.id, null, null);
    return { reset: true };
  }

  private async assertValidOtp(email: string, otp: string): Promise<User> {
    const user = await this.users.findByEmail(email);
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP expired');
    }
    if (user.otpCode !== otp) {
      throw new BadRequestException('Invalid OTP');
    }
    return user;
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessExpiresIn'),
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
    });
    const refreshHash = await bcrypt.hash(refreshToken, 12);
    await this.users.setRefreshTokenHash(user.id, refreshHash);
    return { accessToken, refreshToken };
  }

  private serialize(user: User) {
    const { passwordHash, refreshTokenHash, otpCode, otpExpiresAt, ...safe } = user as any;
    return safe;
  }
}
