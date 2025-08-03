import { ApiProperty } from '@nestjs/swagger';

export class EventStatusChangeDto {
  @ApiProperty({
    description: 'ID of the event',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  eventId: string;

  @ApiProperty({
    description: 'Previous status before change',
    enum: ['draft', 'published', 'unpublished', 'paused', 'ended'],
    example: 'draft'
  })
  previousStatus: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended';

  @ApiProperty({
    description: 'New status after change',
    enum: ['draft', 'published', 'unpublished', 'paused', 'ended'],
    example: 'published'
  })
  newStatus: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended';

  @ApiProperty({
    description: 'ID of user who made the change',
    example: '456e7890-e12b-34d5-a678-426614174001'
  })
  changedBy: string;

  @ApiProperty({
    description: 'Timestamp when change occurred',
    example: '2025-07-31T10:30:00Z'
  })
  changedAt: Date;

  @ApiProperty({
    description: 'Optional reason for status change',
    required: false,
    example: 'Event ready for public registration'
  })
  reason?: string;
}