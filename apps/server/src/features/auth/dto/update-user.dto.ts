import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'User phone number (international format)',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Phone number must be at least 8 characters long' })
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  @Matches(
    /^\+?[\d\s\-()]{8,20}$/,
    { message: 'Phone number must be a valid international format' }
  )
  phone?: string;
}