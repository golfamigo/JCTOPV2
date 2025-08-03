import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventStatusDto {
  @ApiProperty({
    description: 'New status for the event',
    enum: ['draft', 'published', 'unpublished', 'paused', 'ended'],
    example: 'published'
  })
  @IsEnum(['draft', 'published', 'unpublished', 'paused', 'ended'], {
    message: 'Status must be one of: draft, published, unpublished, paused, ended'
  })
  status: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended';

  @ApiProperty({
    description: 'Optional reason for status change',
    required: false,
    example: 'Event ready for public registration'
  })
  @IsOptional()
  @IsString()
  reason?: string;
}