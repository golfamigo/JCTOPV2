import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment } from '../entities/payment.entity';
import { PaymentTransaction } from '../entities/payment-transaction.entity';
import { PaymentProviderService } from './payment-provider.service';
import { ProviderFactory } from '../providers/provider.factory';
import { PaymentRequest, PaymentResponse, PaymentStatusResponse } from '@jctop-event/shared-types';
import { RegistrationCompletionService } from '../../registrations/services/registration-completion.service';

@Injectable()
export class PaymentGatewayService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
    private paymentProviderService: PaymentProviderService,
    private providerFactory: ProviderFactory,
    private configService: ConfigService,
    @Inject(forwardRef(() => RegistrationCompletionService))
    private registrationCompletionService: RegistrationCompletionService,
  ) {}

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    // STEP 1: Get organizer's active payment provider
    const providerConfig = await this.paymentProviderService.getActiveProvider(
      request.organizerId, 
      request.preferredProviderId
    );
    
    if (!providerConfig) {
      throw new BadRequestException('No active payment provider configured for organizer');
    }

    // STEP 2: Get provider implementation
    const provider = this.providerFactory.getProvider(providerConfig.providerId);
    
    // STEP 3: Create payment record
    const payment = await this.createPaymentRecord(request, providerConfig.providerId);
    
    // STEP 4: Get decrypted credentials
    const credentials = await this.paymentProviderService.getDecryptedCredentials(providerConfig);
    
    // STEP 5: Build callback URL with provider and organizer context
    const callbackUrl = `${this.configService.get('BASE_URL')}/api/v1/payments/callback/${providerConfig.providerId}/${request.organizerId}`;
    
    try {
      // STEP 6: Initiate payment with provider
      const providerResponse = await provider.createPayment(
        {
          ...request,
          paymentId: payment.id,
          callbackUrl
        },
        credentials
      );
      
      // STEP 7: Update payment with provider response
      await this.updatePaymentWithProviderResponse(payment.id, providerResponse);
      
      return {
        paymentId: payment.id,
        status: providerResponse.status,
        redirectUrl: providerResponse.redirectUrl,
        clientSecret: providerResponse.clientSecret,
        providerData: providerResponse.providerData,
        amount: request.amount,
        currency: request.currency
      };
    } catch (error) {
      // Mark payment as failed
      await this.updatePaymentStatus(payment.id, 'failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async handleProviderCallback(
    providerId: string,
    organizerId: string, 
    callbackData: any
  ): Promise<void> {
    // STEP 1: Get provider implementation
    const provider = this.providerFactory.getProvider(providerId);
    
    // STEP 2: Get organizer's provider configuration
    const providerConfig = await this.paymentProviderService.getProviderConfig(
      organizerId, 
      providerId
    );
    
    // STEP 3: Get decrypted credentials
    const credentials = await this.paymentProviderService.getDecryptedCredentials(providerConfig);
    
    // STEP 4: Validate callback authenticity
    const isValid = await provider.validateCallback(callbackData, credentials);
    if (!isValid) {
      throw new BadRequestException('Invalid payment callback signature');
    }
    
    // STEP 5: Find payment by merchant trade number and organizer
    const payment = await this.paymentRepository.findOne({
      where: { 
        merchantTradeNo: callbackData.MerchantTradeNo || callbackData.merchantTradeNo,
        organizerId // CRITICAL: Ensure payment belongs to correct organizer
      }
    });
    
    if (!payment) {
      throw new NotFoundException('Payment not found for this organizer');
    }
    
    // STEP 6: Process callback and update payment
    const paymentUpdate = await provider.processCallback(callbackData, payment);
    await this.updatePaymentStatus(
      paymentUpdate.paymentId, 
      paymentUpdate.status, 
      paymentUpdate.providerResponse,
      paymentUpdate.providerTransactionId
    );

    // STEP 7: Create transaction record
    await this.createTransactionRecord({
      paymentId: payment.id,
      type: 'charge',
      status: paymentUpdate.status === 'completed' ? 'completed' : 'failed',
      amount: payment.finalAmount,
      providerTransactionId: paymentUpdate.providerTransactionId,
      providerResponse: paymentUpdate.providerResponse
    });

    // STEP 8: Process registration completion if payment is for an event
    if (paymentUpdate.status === 'completed' && payment.resourceType === 'event') {
      try {
        await this.registrationCompletionService.processPaymentSuccess(payment.id);
      } catch (error) {
        console.error('Failed to process registration completion:', error);
      }
    }
  }

  async getPaymentStatus(paymentId: string, organizerId: string): Promise<PaymentStatusResponse> {
    const payment = await this.paymentRepository.findOne({
      where: { 
        id: paymentId,
        organizerId // CRITICAL: Ensure payment belongs to correct organizer
      }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      payment,
      status: payment.status
    };
  }

  private async createPaymentRecord(request: PaymentRequest, providerId: string): Promise<Payment> {
    const merchantTradeNo = this.generateMerchantTradeNo();
    
    const payment = this.paymentRepository.create({
      organizerId: request.organizerId,
      resourceType: request.resourceType,
      resourceId: request.resourceId,
      providerId,
      merchantTradeNo,
      amount: request.amount,
      discountAmount: 0, // Will be updated if discount applied
      finalAmount: request.amount,
      currency: request.currency,
      paymentMethod: request.paymentMethod || 'ALL',
      status: 'pending',
      metadata: request.metadata || {}
    });

    return await this.paymentRepository.save(payment);
  }

  private async updatePaymentWithProviderResponse(paymentId: string, response: PaymentResponse): Promise<void> {
    await this.paymentRepository.update(paymentId, {
      status: response.status === 'requires_action' ? 'pending' : response.status,
      providerResponse: response.providerData
    });
  }

  private async updatePaymentStatus(
    paymentId: string, 
    status: Payment['status'], 
    providerResponse?: Record<string, any>,
    providerTransactionId?: string
  ): Promise<void> {
    const updateData: Partial<Payment> = { status };
    
    if (providerResponse) {
      updateData.providerResponse = providerResponse;
    }
    
    if (providerTransactionId) {
      updateData.providerTransactionId = providerTransactionId;
    }

    await this.paymentRepository.update(paymentId, updateData);
  }

  private async createTransactionRecord(data: {
    paymentId: string;
    type: PaymentTransaction['type'];
    status: PaymentTransaction['status'];
    amount: number;
    providerTransactionId?: string;
    providerResponse?: Record<string, any>;
  }): Promise<PaymentTransaction> {
    const transaction = this.paymentTransactionRepository.create(data);
    return await this.paymentTransactionRepository.save(transaction);
  }

  private generateMerchantTradeNo(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY${timestamp.slice(-8)}${random}`.substring(0, 20);
  }
}