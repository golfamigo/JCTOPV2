import { PaymentResponse, PaymentStatusResponse } from '@jctop-event/shared-types';

export class PaymentResponseDto implements PaymentResponse {
  paymentId: string;
  status: 'pending' | 'requires_action' | 'processing' | 'completed' | 'failed';
  redirectUrl?: string;
  clientSecret?: string;
  providerData?: Record<string, any>;
  amount: number;
  currency: string;
}

export class PaymentStatusResponseDto implements PaymentStatusResponse {
  payment: {
    id: string;
    organizerId: string;
    resourceType: string;
    resourceId: string;
    providerId: string;
    providerTransactionId?: string;
    merchantTradeNo: string;
    amount: number;
    discountAmount?: number;
    finalAmount: number;
    currency: string;
    paymentMethod: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    providerResponse?: Record<string, any>;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
}