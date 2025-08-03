import { IsUUID, IsString, IsOptional, IsObject, MaxLength } from 'class-validator';

export class CreateInvoiceSettingsDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  companyAddress?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  taxNumber?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  invoicePrefix?: string;

  @IsString()
  @IsOptional()
  invoiceFooter?: string;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}

export class UpdateInvoiceSettingsDto extends CreateInvoiceSettingsDto {}

export class InvoiceSettingsResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  eventId: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  companyAddress?: string;

  @IsString()
  @IsOptional()
  taxNumber?: string;

  @IsString()
  @IsOptional()
  invoicePrefix?: string;

  @IsString()
  @IsOptional()
  invoiceFooter?: string;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;

  constructor(partial: Partial<InvoiceSettingsResponseDto>) {
    Object.assign(this, partial);
  }
}