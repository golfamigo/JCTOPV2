import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address to send password reset link',
    example: 'john@example.com',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(100, { message: 'Email must not exceed 100 characters' })
  email: string;
}