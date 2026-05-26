import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  @Length(2, 120)
  fullName: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\+?[0-9 \-]{7,20}$/)
  mobile: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  line1: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  @Length(3, 20)
  pincode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
