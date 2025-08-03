import { IsString, IsEnum, IsBoolean, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ValidationRulesDto {
  @IsOptional()
  @IsNumber()
  minLength?: number;

  @IsOptional()
  @IsNumber()
  maxLength?: number;

  @IsOptional()
  @IsString()
  pattern?: string;
}

export class CreateCustomFieldDto {
  @IsString()
  fieldName: string;

  @IsEnum(['text', 'email', 'number', 'select', 'checkbox', 'textarea'])
  fieldType: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea';

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ValidationRulesDto)
  validationRules?: ValidationRulesDto;

  @IsNumber()
  order: number;
}

export class UpdateCustomFieldDto {
  @IsOptional()
  @IsString()
  fieldName?: string;

  @IsOptional()
  @IsEnum(['text', 'email', 'number', 'select', 'checkbox', 'textarea'])
  fieldType?: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea';

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ValidationRulesDto)
  validationRules?: ValidationRulesDto;

  @IsOptional()
  @IsNumber()
  order?: number;
}