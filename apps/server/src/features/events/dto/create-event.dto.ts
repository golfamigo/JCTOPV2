import { IsString, IsNotEmpty, IsDateString, IsUUID, MaxLength, IsOptional } from 'class-validator';
import { CreateEventDto as ICreateEventDto } from '@jctop-event/shared-types';

export class CreateEventDto implements ICreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  venueId: string;
}