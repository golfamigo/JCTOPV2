import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class AttendeeSearchQueryDto {
  @IsString()
  query: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

export class AttendeeSearchResultDto {
  id: string;
  name: string;
  email: string;
  registrationId: string;
  status: 'pending' | 'paid' | 'cancelled' | 'checkedIn';
  checkedInAt?: Date;
  ticketType?: string;

  constructor(registration: any, user: any, ticketTypeMap?: Map<string, any>) {
    // Input validation for required fields
    if (!registration?.id || !user?.name || !user?.email) {
      throw new Error('Invalid registration or user data provided');
    }

    this.id = registration.id;
    this.name = user.name;
    this.email = user.email;
    this.registrationId = registration.id;
    this.status = registration.status || 'pending';
    this.checkedInAt = registration.checkedInAt || null;
    
    // Extract ticket type names from selections
    let ticketTypeNames: string[] = [];
    if (registration.ticketSelections && Array.isArray(registration.ticketSelections) && ticketTypeMap) {
      ticketTypeNames = registration.ticketSelections
        .map((selection: any) => {
          const ticketType = ticketTypeMap.get(selection.ticketTypeId);
          return ticketType?.name;
        })
        .filter(Boolean);
    }
    
    this.ticketType = ticketTypeNames.length > 0 ? ticketTypeNames.join(', ') : null;
  }
}

export class AttendeeSearchResponseDto {
  attendees: AttendeeSearchResultDto[];
  total: number;
  limit: number;
  offset: number;

  constructor(attendees: AttendeeSearchResultDto[], total: number, limit: number, offset: number) {
    this.attendees = attendees;
    this.total = total;
    this.limit = limit;
    this.offset = offset;
  }
}