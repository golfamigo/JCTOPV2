import { ApiProperty } from '@nestjs/swagger';
import { User } from '@jctop-event/shared-types';

export class AuthResponseDto {
  @ApiProperty({
    description: 'User information',
    type: 'object',
  })
  user: Omit<User, 'passwordHash'>;

  @ApiProperty({
    description: 'Success message',
    example: 'Registration successful',
  })
  message: string;
}