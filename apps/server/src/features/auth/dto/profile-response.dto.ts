import { ApiProperty } from '@nestjs/swagger';
import { User } from '@jctop-event/shared-types';

export class ProfileResponseDto {
  @ApiProperty({
    description: 'User profile information',
    type: 'object',
  })
  user: Omit<User, 'passwordHash'>;

  @ApiProperty({
    description: 'Success message',
    example: 'Profile updated successfully',
  })
  message: string;
}