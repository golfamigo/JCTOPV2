// Simple unit tests without database dependency
import { ECPayProvider } from './ecpay.provider';
import { ConfigService } from '@nestjs/config';

describe('ECPayProvider Unit Tests', () => {
  let provider: ECPayProvider;
  let mockConfigService: jest.Mocked<ConfigService>;

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

  describe('Basic Provider Properties', () => {
    it('should have correct provider ID', () => {
      expect(provider.providerId).toBe('ecpay');
    });
  });

  describe('Credential Validation', () => {
    const validCredentials = {
      merchantId: '2000132',
      hashKey: '5294y06JbISpM5x9',
      hashIV: 'v77hoKGq4kWxNNIS',
      environment: 'development' as const,
    };

    it('should validate correct credentials', async () => {
      const result = await provider.validateCredentials(validCredentials);
      expect(result).toBe(true);
    });

    it('should reject empty merchant ID', async () => {
      const invalidCredentials = { ...validCredentials, merchantId: '' };
      const result = await provider.validateCredentials(invalidCredentials);
      expect(result).toBe(false);
    });

    it('should reject non-numeric merchant ID', async () => {
      const invalidCredentials = { ...validCredentials, merchantId: 'abc123' };
      const result = await provider.validateCredentials(invalidCredentials);
      expect(result).toBe(false);
    });

    it('should reject empty hash key', async () => {
      const invalidCredentials = { ...validCredentials, hashKey: '' };
      const result = await provider.validateCredentials(invalidCredentials);
      expect(result).toBe(false);
    });

    it('should reject empty hash IV', async () => {
      const invalidCredentials = { ...validCredentials, hashIV: '' };
      const result = await provider.validateCredentials(invalidCredentials);
      expect(result).toBe(false);
    });
  });

  describe('Hash Generation', () => {
    const credentials = {
      merchantId: '2000132',
      hashKey: '5294y06JbISpM5x9',
      hashIV: 'v77hoKGq4kWxNNIS',
      environment: 'development' as const,
    };

    it('should generate consistent hash for same input', () => {
      const testData = {
        MerchantID: '2000132',
        MerchantTradeNo: 'TEST123456789',
        TotalAmount: '1000',
      };

      // Access private method for testing
      const hash1 = (provider as any).generateCheckMacValue(testData, credentials);
      const hash2 = (provider as any).generateCheckMacValue(testData, credentials);

      expect(hash1).toBeDefined();
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for different data', () => {
      const testData1 = {
        MerchantID: '2000132',
        MerchantTradeNo: 'TEST123456789',
        TotalAmount: '1000',
      };

      const testData2 = {
        MerchantID: '2000132',
        MerchantTradeNo: 'TEST987654321',
        TotalAmount: '2000',
      };

      const hash1 = (provider as any).generateCheckMacValue(testData1, credentials);
      const hash2 = (provider as any).generateCheckMacValue(testData2, credentials);

      expect(hash1).not.toBe(hash2);
    });

    it('should exclude CheckMacValue from hash calculation', () => {
      const testDataWithHash = {
        MerchantID: '2000132',
        MerchantTradeNo: 'TEST123456789',
        TotalAmount: '1000',
        CheckMacValue: 'should-be-ignored',
      };

      const testDataWithoutHash = {
        MerchantID: '2000132',
        MerchantTradeNo: 'TEST123456789',
        TotalAmount: '1000',
      };

      const hash1 = (provider as any).generateCheckMacValue(testDataWithHash, credentials);
      const hash2 = (provider as any).generateCheckMacValue(testDataWithoutHash, credentials);

      expect(hash1).toBe(hash2);
    });
  });

  describe('Payment Creation', () => {
    const mockPaymentRequest = {
      organizerId: 'org-1',
      resourceType: 'event' as const,
      resourceId: 'event-1',
      amount: 1000,
      currency: 'TWD',
      description: 'Test Event Registration',
      paymentMethod: 'Credit',
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

    const credentials = {
      merchantId: '2000132',
      hashKey: '5294y06JbISpM5x9',
      hashIV: 'v77hoKGq4kWxNNIS',
      environment: 'development' as const,
    };

    it('should create payment with required fields', async () => {
      const result = await provider.createPayment(
        mockPaymentRequest,
        mockPayment,
        credentials,
        {
          callbackUrl: 'https://test.com/callback',
          returnUrl: 'https://test.com/return',
        }
      );

      expect(result.paymentId).toBe(mockPayment.id);
      expect(result.status).toBe('requires_action');
      expect(result.amount).toBe(mockPaymentRequest.amount);
      expect(result.currency).toBe(mockPaymentRequest.currency);
      expect(result.merchantTradeNo).toBe(mockPayment.merchantTradeNo);
      expect(result.redirectUrl).toContain('ecpay.com.tw');
      expect(result.formData).toBeDefined();
    });

    it('should include all required ECPay parameters', async () => {
      const result = await provider.createPayment(
        mockPaymentRequest,
        mockPayment,
        credentials,
        {
          callbackUrl: 'https://test.com/callback',
          returnUrl: 'https://test.com/return',
        }
      );

      const formData = result.formData;
      expect(formData).toHaveProperty('MerchantID', credentials.merchantId);
      expect(formData).toHaveProperty('MerchantTradeNo', mockPayment.merchantTradeNo);
      expect(formData).toHaveProperty('TotalAmount', mockPayment.finalAmount.toString());
      expect(formData).toHaveProperty('TradeDesc', mockPaymentRequest.description);
      expect(formData).toHaveProperty('PaymentType', 'aio');
      expect(formData).toHaveProperty('ChoosePayment', 'Credit');
      expect(formData).toHaveProperty('CheckMacValue');
    });

    it('should use correct environment URL', async () => {
      // Test development environment
      const devResult = await provider.createPayment(
        mockPaymentRequest,
        mockPayment,
        { ...credentials, environment: 'development' },
        { callbackUrl: 'https://test.com/callback', returnUrl: 'https://test.com/return' }
      );
      expect(devResult.redirectUrl).toContain('payment-stage.ecpay.com.tw');

      // Test production environment
      const prodResult = await provider.createPayment(
        mockPaymentRequest,
        mockPayment,
        { ...credentials, environment: 'production' },
        { callbackUrl: 'https://test.com/callback', returnUrl: 'https://test.com/return' }
      );
      expect(prodResult.redirectUrl).toContain('payment.ecpay.com.tw');
    });
  });

  describe('Callback Processing', () => {
    const mockCallbackData = {
      MerchantID: '2000132',
      MerchantTradeNo: 'PAY123456789',
      RtnCode: '1',
      RtnMsg: 'SUCCESS',
      TradeNo: '2309281234567890',
      TradeAmt: '1000',
      PaymentDate: '2023/09/28 14:30:25',
      PaymentType: 'Credit_CreditCard',
      PaymentTypeChargeFee: '30',
      TradeDate: '2023/09/28 14:25:10',
      CheckMacValue: 'valid-test-hash',
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

    it('should process successful payment callback', async () => {
      const result = await provider.processCallback(mockCallbackData, mockPayment);

      expect(result.paymentId).toBe(mockPayment.id);
      expect(result.status).toBe('completed');
      expect(result.providerTransactionId).toBe(mockCallbackData.TradeNo);
      expect(result.providerResponse).toEqual(mockCallbackData);
      expect(result.metadata).toBeDefined();
    });

    it('should process failed payment callback', async () => {
      const failedCallbackData = {
        ...mockCallbackData,
        RtnCode: '0',
        RtnMsg: 'PAYMENT_FAILED',
      };

      const result = await provider.processCallback(failedCallbackData, mockPayment);

      expect(result.paymentId).toBe(mockPayment.id);
      expect(result.status).toBe('failed');
      expect(result.providerTransactionId).toBe(mockCallbackData.TradeNo);
    });

    it('should include payment metadata in response', async () => {
      const result = await provider.processCallback(mockCallbackData, mockPayment);

      expect(result.metadata).toBeDefined();
      expect(result.metadata).toHaveProperty('paymentType', mockCallbackData.PaymentType);
      expect(result.metadata).toHaveProperty('paymentDate', mockCallbackData.PaymentDate);
      expect(result.metadata).toHaveProperty('chargeFee', mockCallbackData.PaymentTypeChargeFee);
    });
  });
});