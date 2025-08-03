import { IsUUID, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class EventStatisticsResponseDto {
  @IsUUID()
  eventId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalRegistrations: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  checkedInCount: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  attendanceRate: number;

  @IsDateString()
  lastUpdated: string;

  constructor(
    eventId: string,
    totalRegistrations: number,
    checkedInCount: number,
    lastUpdated: Date = new Date()
  ) {
    this.eventId = eventId;
    this.totalRegistrations = totalRegistrations;
    this.checkedInCount = checkedInCount;
    this.attendanceRate = totalRegistrations > 0 ? 
      Number(((checkedInCount / totalRegistrations) * 100).toFixed(1)) : 0;
    this.lastUpdated = lastUpdated.toISOString();
  }
}