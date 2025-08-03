import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Success message for password reset request',
    example: 'If an account with that email address exists, we have sent you a password reset link.',
  })
  message: string;
}