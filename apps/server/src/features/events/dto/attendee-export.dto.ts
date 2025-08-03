import { IsEnum, IsOptional } from 'class-validator';

export class AttendeeExportQueryDto {
  @IsEnum(['csv', 'excel'])
  format: 'csv' | 'excel';

  @IsOptional()
  @IsEnum(['pending', 'paid', 'cancelled', 'checkedIn'])
  status?: 'pending' | 'paid' | 'cancelled' | 'checkedIn';

  @IsOptional()
  search?: string;
}