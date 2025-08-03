import { IsString, IsNotEmpty, IsNumber, Min, Max, MaxLength, IsInt } from 'class-validator';
import { CreateTicketTypeDto as ICreateTicketTypeDto } from '@jctop-event/shared-types';

export class CreateTicketTypeDto implements ICreateTicketTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsNumber()
  @Min(0)
  @Max(999999.99)
  price: number;

  @IsInt()
  @Min(1)
  @Max(999999)
  quantity: number;
}