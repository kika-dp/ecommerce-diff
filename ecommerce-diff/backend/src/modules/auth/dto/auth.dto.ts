import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty() @IsString() @Length(2, 120) fullName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @Matches(/^\+?[0-9 \-]{7,20}$/) mobile: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
}

export class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
}

export class RefreshDto {
  @ApiProperty() @IsString() refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty() @IsEmail() email: string;
}

export class VerifyOtpDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @Length(4, 10) otp: string;
}

export class ResetPasswordDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @Length(4, 10) otp: string;
  @ApiProperty() @IsString() @MinLength(8) newPassword: string;
}
