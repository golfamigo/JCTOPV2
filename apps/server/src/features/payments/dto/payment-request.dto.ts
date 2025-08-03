import { IsString, IsNumber, IsOptional, IsObject, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentRequestDto {
  @IsUUID()
  organizerId: string;

  @IsString()
  resourceType: string; // 'event', 'subscription', 'marketplace', etc.

  @IsUUID()
  resourceId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(1)
  @Max(99999999)
  amount: number;

  @IsString()
  currency: string = 'TWD';

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  preferredProviderId?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}