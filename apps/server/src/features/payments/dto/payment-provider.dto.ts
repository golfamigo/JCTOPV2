import { IsString, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { PaymentProviderDto, UpdatePaymentProviderDto } from '@jctop-event/shared-types';

export class CreatePaymentProviderDto implements PaymentProviderDto {
  @IsString()
  providerId: string;

  @IsString()
  providerName: string;

  @IsObject()
  credentials: Record<string, any>;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdatePaymentProviderDtoRequest implements UpdatePaymentProviderDto {
  @IsObject()
  @IsOptional()
  credentials?: Record<string, any>;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class ECPayCredentialsDto {
  @IsString()
  merchantId: string;

  @IsString()
  hashKey: string;

  @IsString()
  hashIV: string;

  @IsString()
  environment: 'development' | 'production';

  @IsString()
  @IsOptional()
  returnUrl?: string;
}