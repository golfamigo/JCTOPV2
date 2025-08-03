import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({
    description: 'Encrypted QR code data',
    example: 'encrypted_qr_code_string'
  })
  @IsNotEmpty()
  @IsString()
  qrCode: string;
}

export class CheckInResponseDto {
  @ApiProperty({
    description: 'Whether the check-in was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Attendee details',
    required: false
  })
  attendee?: {
    name: string;
    email: string;
    ticketType: string;
  };

  @ApiProperty({
    description: 'Error message if check-in failed',
    required: false
  })
  error?: string;

  @ApiProperty({
    description: 'Error code for specific error types',
    required: false,
    enum: ['ALREADY_CHECKED_IN', 'TICKET_NOT_FOUND', 'INVALID_QR_CODE']
  })
  errorCode?: 'ALREADY_CHECKED_IN' | 'TICKET_NOT_FOUND' | 'INVALID_QR_CODE';
}