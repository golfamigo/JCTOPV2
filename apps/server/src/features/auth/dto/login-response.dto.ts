import { ApiProperty } from '@nestjs/swagger';
import { User } from '@jctop-event/shared-types';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
  })
  user: Omit<User, 'passwordHash'>;

  @ApiProperty({
    description: 'Success message',
    example: 'Login successful',
  })
  message: string;
}