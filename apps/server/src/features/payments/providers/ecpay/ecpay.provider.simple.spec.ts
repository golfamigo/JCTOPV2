// Simple ECPay provider tests that work with current implementation
import { ECPayProvider } from './ecpay.provider';
import { ConfigService } from '@nestjs/config';

describe('ECPayProvider Simple Tests', () => {
  let provider: ECPayProvider;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'BASE_URL':
            return 'http://localhost:3000';
          case 'CLIENT_BASE_URL':
            return 'http://localhost:3001';
          default:
            return undefined;
        }
      }),
    } as any;

    provider = new ECPayProvider(mockConfigService);
  });

  it('should have correct provider ID', () => {
    expect(provider.providerId).toBe('ecpay');
  });

  it('should validate correct credentials', async () => {
    const validCredentials = {
      merchantId: '2000132',
      hashKey: '5294y06JbISpM5x9',
      hashIV: 'v77hoKGq4kWxNNIS',
      environment: 'development' as const,
    };

    const result = await provider.validateCredentials(validCredentials);
    expect(result).toBe(true);
  });

  it('should reject invalid credentials', async () => {
    const invalidCredentials = {
      merchantId: '',
      hashKey: '5294y06JbISpM5x9',
      hashIV: 'v77hoKGq4kWxNNIS',
      environment: 'development' as const,
    };

    const result = await provider.validateCredentials(invalidCredentials);
    expect(result).toBe(false);
  });

  it('should create payment with basic parameters', async () => {
    const request = {
      organizerId: 'org-1',
      resourceType: 'event' as const,
      resourceId: 'event-1',
      amount: 1000,
      currency: 'TWD',
      description: 'Test Event Registration',
      paymentMethod: 'Credit',
      paymentId: 'payment-1',
      callbackUrl: 'https://test.com/callback',
    };

    const credentials = {
      merchantId: '2000132',
      hashKey: '5294y06JbISpM5x9',
      hashIV: 'v77hoKGq4kWxNNIS',
      environment: 'development' as const,
    };

    const result = await provider.createPayment(request, credentials);

    expect(result).toBeDefined();
    expect(result.paymentId).toBe('payment-1');
    expect(result.status).toBe('requires_action');
    expect(result.amount).toBe(1000);
    expect(result.currency).toBe('TWD');
    expect(result.redirectUrl).toContain('ecpay.com.tw');
  });

  it('should process successful callback', async () => {
    const callbackData = {
      MerchantID: '2000132',
      MerchantTradeNo: 'PAY123456789',
      RtnCode: '1',
      RtnMsg: 'SUCCESS',
      TradeNo: '2309281234567890',
      TradeAmt: '1000',
      PaymentDate: '2023/09/28 14:30:25',
      PaymentType: 'Credit_CreditCard',
      CheckMacValue: 'test-hash',
    };

    const mockPayment = {
      id: 'payment-1',
      organizerId: 'org-1',
      resourceType: 'event' as const,
      resourceId: 'event-1',
      providerId: 'ecpay',
      merchantTradeNo: 'PAY123456789',
      amount: 1000,
      discountAmount: 0,
      finalAmount: 1000,
      currency: 'TWD',
      paymentMethod: 'Credit',
      status: 'pending' as const,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      organizer: null as any,
    };

    const result = await provider.processCallback(callbackData, mockPayment);

    expect(result).toBeDefined();
    expect(result.paymentId).toBe('payment-1');
    expect(result.status).toBe('completed');
    expect(result.providerTransactionId).toBe('2309281234567890');
    expect(result.providerResponse).toBeDefined();
  });
});