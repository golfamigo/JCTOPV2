import { PaymentRequest, PaymentResponse, Payment, PaymentUpdate } from '@jctop-event/shared-types';

export interface IPaymentProvider {
  readonly providerId: string;
  
  /**
   * Validate provider-specific credentials format and connectivity
   */
  validateCredentials(credentials: Record<string, any>): Promise<boolean>;
  
  /**
   * Create a payment with the provider
   */
  createPayment(
    request: PaymentRequest & { paymentId: string; callbackUrl: string },
    credentials: Record<string, any>
  ): Promise<PaymentResponse>;
  
  /**
   * Validate the authenticity of a provider callback
   */
  validateCallback(callbackData: any, credentials: Record<string, any>): Promise<boolean>;
  
  /**
   * Process a validated callback and return payment update information
   */
  processCallback(callbackData: any, payment: Payment): Promise<PaymentUpdate>;
}