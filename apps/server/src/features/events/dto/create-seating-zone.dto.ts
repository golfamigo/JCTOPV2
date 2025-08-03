import { IsString, IsNotEmpty, Min, Max, MaxLength, IsOptional, IsInt } from 'class-validator';
import { CreateSeatingZoneDto as ICreateSeatingZoneDto } from '@jctop-event/shared-types';

export class CreateSeatingZoneDto implements ICreateSeatingZoneDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsInt()
  @Min(1)
  @Max(999999)
  capacity: number;

  @IsOptional()
  @IsString()
  description?: string;
}