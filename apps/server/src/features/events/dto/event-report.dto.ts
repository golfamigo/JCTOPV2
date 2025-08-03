import { IsUUID, IsNumber, IsDateString, Min, IsObject, IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Event } from '../../../entities/event.entity';

export class RegistrationStatsDto {
  @IsNumber()
  @Min(0)
  total: number;

  @IsObject()
  byStatus: {
    pending: number;
    paid: number;
    cancelled: number;
    checkedIn: number;
  };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketTypeStats)
  byTicketType: TicketTypeStats[];
}

export class TicketTypeStats {
  @IsUUID()
  ticketTypeId: string;

  @IsString()
  ticketTypeName: string;

  @IsNumber()
  @Min(0)
  quantitySold: number;

  @IsNumber()
  @Min(0)
  revenue: number;
}

export class RevenueStatsDto {
  @IsNumber()
  @Min(0)
  gross: number;

  @IsNumber()
  @Min(0)
  discountAmount: number;

  @IsNumber()
  @Min(0)
  net: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketTypeStats)
  byTicketType: TicketTypeStats[];
}

export class AttendanceStatsDto {
  @IsNumber()
  @Min(0)
  registered: number;

  @IsNumber()
  @Min(0)
  checkedIn: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  rate: number;

  @IsDateString()
  @IsOptional()
  lastCheckInTime?: string;
}

export class TimelineDataPointDto {
  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0)
  registrations: number;

  @IsNumber()
  @Min(0)
  revenue: number;

  @IsNumber()
  @Min(0)
  cumulativeRegistrations: number;

  @IsNumber()
  @Min(0)
  cumulativeRevenue: number;
}

export class EventReportResponseDto {
  @IsUUID()
  eventId: string;

  @ValidateNested()
  @Type(() => Event)
  eventDetails: Event;

  @ValidateNested()
  @Type(() => RegistrationStatsDto)
  registrationStats: RegistrationStatsDto;

  @ValidateNested()
  @Type(() => RevenueStatsDto)
  revenue: RevenueStatsDto;

  @ValidateNested()
  @Type(() => AttendanceStatsDto)
  attendanceStats: AttendanceStatsDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimelineDataPointDto)
  timeline: TimelineDataPointDto[];

  @IsDateString()
  generatedAt: string;

  constructor(partial: Partial<EventReportResponseDto>) {
    Object.assign(this, partial);
    this.generatedAt = new Date().toISOString();
  }
}

export class ExportFormatDto {
  @IsString()
  format: 'pdf' | 'csv' | 'excel';
}