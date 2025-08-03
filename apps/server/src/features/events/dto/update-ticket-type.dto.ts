import { IsString, IsNotEmpty, IsNumber, Min, Max, MaxLength, IsOptional, IsInt } from 'class-validator';
import { UpdateTicketTypeDto as IUpdateTicketTypeDto } from '@jctop-event/shared-types';

export class UpdateTicketTypeDto implements IUpdateTicketTypeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999.99)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999999)
  quantity?: number;
}