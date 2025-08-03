import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(100, { message: 'Email must not exceed 100 characters' })
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters, must contain at least one uppercase letter, one lowercase letter, and one number)',
    example: 'Password123',
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