import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class DiscountValidationDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;
}