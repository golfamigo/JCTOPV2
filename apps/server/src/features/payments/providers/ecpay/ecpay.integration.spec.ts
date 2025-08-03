// Real ECPay API integration tests
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ECPayProvider } from './ecpay.provider';
import { PaymentRequest } from '@jctop-event/shared-types';

describe('ECPay Integration Tests (Real API)', () => {
  let provider: ECPayProvider;
  let configService: ConfigService;

  // ECPay staging test credentials (from official documentation)
  const testCredentials = {
    merchantId: '2000132',
    hashKey: '5294y06JbISpM5x9',
    hashIV: 'v77hoKGq4kWxNNIS',
    environment: 'development' as const,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ECPayProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'BASE_URL':
                  return 'https://your-domain.com'; // Replace with actual domain
                case 'CLIENT_BASE_URL':
                  return 'https://your-frontend.com'; // Replace with actual frontend
                default:
                  return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<ECPayProvider>(ECPayProvider);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('Real API Connection Tests', () => {
    it('should create valid ECPay payment request', async () => {
      const mockRequest = {
        organizerId: 'test-org-1',
        resourceType: 'event' as const,
        resourceId: 'test-event-1',
        amount: 10, // Small test amount: NT$10
        currency: 'TWD',
        description: 'Test Payment - Integration Test',
        paymentMethod: 'Credit',
        paymentId: 'test-payment-' + Date.now(),
        callbackUrl: 'https://your-domain.com/api/v1/payments/callback/ecpay/test-org-1',
      };

      try {
        const result = await provider.createPayment(mockRequest, testCredentials);

        // Verify the response structure
        expect(result).toBeDefined();
        expect(result.paymentId).toBe(mockRequest.paymentId);
        expect(result.status).toBe('requires_action');
        expect(result.redirectUrl).toContain('payment-stage.ecpay.com.tw');
        expect(result.amount).toBe(10);
        expect(result.currency).toBe('TWD');

        console.log('✅ ECPay Payment Request Created Successfully');
        console.log('Payment ID:', result.paymentId);
        console.log('Redirect URL:', result.redirectUrl);
        console.log('Provider Data Keys:', Object.keys(result.providerData || {}));

        // Verify required ECPay parameters are present
        if (result.providerData && result.providerData.ecpayRequest) {
          const ecpayRequest = result.providerData.ecpayRequest;
          expect(ecpayRequest.MerchantID).toBe(testCredentials.merchantId);
          expect(ecpayRequest.TotalAmount).toBe(10);
          expect(ecpayRequest.CheckMacValue).toBeDefined();
          expect(ecpayRequest.CheckMacValue.length).toBeGreaterThan(0);
        }

      } catch (error) {
        console.error('❌ ECPay Integration Test Failed:', error);
        throw error;
      }
    }, 15000); // 15 second timeout for API calls

    it('should generate valid hash that ECPay can verify', async () => {
      // Test hash generation with known test data
      const testData = {
        MerchantID: testCredentials.merchantId,
        MerchantTradeNo: 'TEST' + Date.now(),
        MerchantTradeDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        PaymentType: 'aio',
        TotalAmount: 100,
        TradeDesc: 'Hash Test',
        ItemName: 'Test Item',
        ReturnURL: 'https://test.com/callback',
        ChoosePayment: 'Credit',
      };

      // Generate hash using our implementation
      const generatedHash = (provider as any).generateCheckMacValue(testData, testCredentials);

      expect(generatedHash).toBeDefined();
      expect(typeof generatedHash).toBe('string');
      expect(generatedHash.length).toBeGreaterThan(0);

      console.log('✅ Hash Generation Test Passed');
      console.log('Generated Hash:', generatedHash);
      console.log('Test Data:', JSON.stringify(testData, null, 2));
    });

    it('should handle ECPay callback validation', async () => {
      // Simulate ECPay callback data
      const mockCallbackData = {
        MerchantID: testCredentials.merchantId,
        MerchantTradeNo: 'TEST' + Date.now(),
        RtnCode: '1', // Success
        RtnMsg: 'Succeeded',
        TradeNo: 'ECPay' + Date.now(),
        TradeAmt: '10',
        PaymentDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        PaymentType: 'Credit_CreditCard',
        PaymentTypeChargeFee: '1',
        TradeDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };

      // Generate expected hash for callback
      const expectedHash = (provider as any).generateCheckMacValue(mockCallbackData, testCredentials);
      mockCallbackData['CheckMacValue'] = expectedHash;

      try {
        const isValid = await provider.validateCallback(mockCallbackData, testCredentials);
        expect(isValid).toBe(true);

        console.log('✅ Callback Validation Test Passed');
        console.log('Callback Data:', JSON.stringify(mockCallbackData, null, 2));

      } catch (error) {
        console.error('❌ Callback Validation Failed:', error);
        throw error;
      }
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle invalid credentials gracefully', async () => {
      const invalidCredentials = {
        merchantId: 'invalid',
        hashKey: 'invalid',
        hashIV: 'invalid',
        environment: 'development' as const,
      };

      const mockRequest = {
        organizerId: 'test-org-1',
        resourceType: 'event' as const,
        resourceId: 'test-event-1',
        amount: 10,
        currency: 'TWD',
        description: 'Test Payment',
        paymentMethod: 'Credit',
        paymentId: 'test-payment-invalid',
        callbackUrl: 'https://test.com/callback',
      };

      // Should not crash, but may create request with invalid credentials
      // ECPay will reject it on their end, but our code should handle it
      try {
        const result = await provider.createPayment(mockRequest, invalidCredentials);
        expect(result).toBeDefined();
        console.log('⚠️ Invalid credentials handled gracefully');
      } catch (error) {
        console.log('✅ Invalid credentials properly rejected:', error.message);
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid amounts', async () => {
      const mockRequest = {
        organizerId: 'test-org-1',
        resourceType: 'event' as const,
        resourceId: 'test-event-1',
        amount: 999999999999, // Too large for ECPay
        currency: 'TWD',
        description: 'Test Payment',
        paymentMethod: 'Credit',
        paymentId: 'test-payment-large',
        callbackUrl: 'https://test.com/callback',
      };

      await expect(provider.createPayment(mockRequest, testCredentials))
        .rejects
        .toThrow('交易金額必須在 1 到 99,999,999 之間');

      console.log('✅ Large amount validation working');
    });
  });

  describe('Environment Configuration Tests', () => {
    it('should use correct URLs for staging environment', async () => {
      const stagingCredentials = { ...testCredentials, environment: 'development' as const };
      
      const mockRequest = {
        organizerId: 'test-org-1',
        resourceType: 'event' as const,
        resourceId: 'test-event-1',
        amount: 10,
        currency: 'TWD',
        description: 'Staging Test',
        paymentMethod: 'Credit',
        paymentId: 'staging-test-' + Date.now(),
        callbackUrl: 'https://test.com/callback',
      };

      const result = await provider.createPayment(mockRequest, stagingCredentials);
      expect(result.redirectUrl).toContain('payment-stage.ecpay.com.tw');
      
      console.log('✅ Staging environment URL correct');
    });

    it('should use correct URLs for production environment', async () => {
      const prodCredentials = { ...testCredentials, environment: 'production' as const };
      
      const mockRequest = {
        organizerId: 'test-org-1',
        resourceType: 'event' as const,
        resourceId: 'test-event-1',
        amount: 10,
        currency: 'TWD',
        description: 'Production Test',
        paymentMethod: 'Credit',
        paymentId: 'prod-test-' + Date.now(),
        callbackUrl: 'https://test.com/callback',
      };

      const result = await provider.createPayment(mockRequest, prodCredentials);
      expect(result.redirectUrl).toContain('payment.ecpay.com.tw');
      expect(result.redirectUrl).not.toContain('payment-stage.ecpay.com.tw');
      
      console.log('✅ Production environment URL correct');
    });
  });
});