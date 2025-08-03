import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token from email',
    example: 'abcd1234567890efgh',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password (minimum 8 characters, must contain at least one uppercase letter, one lowercase letter, and one number)',
    example: 'NewPassword123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,50}$/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and be 8-50 characters long' }
  )
  password: string;
}