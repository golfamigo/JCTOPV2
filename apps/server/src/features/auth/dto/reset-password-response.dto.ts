import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Success message for password reset completion',
    example: 'Your password has been successfully reset. You can now log in with your new password.',
  })
  message: string;
}