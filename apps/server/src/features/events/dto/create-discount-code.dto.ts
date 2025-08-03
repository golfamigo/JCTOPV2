import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, Max, Min, Length, ValidateIf } from 'class-validator';

export class CreateDiscountCodeDto {
  @IsString({ message: 'Code must be a string' })
  @Length(2, 50, { message: 'Code must be between 2 and 50 characters' })
  code: string;

  @IsEnum(['percentage', 'fixed_amount'], { message: 'Type must be either "percentage" or "fixed_amount"' })
  type: 'percentage' | 'fixed_amount';

  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'Value must be a valid number' })
  @Min(0.01, { message: 'Value must be greater than 0' })
  @ValidateIf(o => o.type === 'percentage')
  @Max(100, { message: 'Percentage values must be between 0.01 and 100' })
  @ValidateIf(o => o.type === 'fixed_amount')  
  @Max(999999.99, { message: 'Fixed amount values must be less than 1,000,000' })
  value: number;

  @IsOptional()
  @IsDateString({}, { message: 'Expiration date must be a valid ISO date string' })
  expiresAt?: string;
}