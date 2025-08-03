import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ECPayProvider } from './ecpay.provider';
import { Payment } from '../../entities/payment.entity';
import { PaymentRequest } from '@jctop-event/shared-types';

describe('ECPayProvider', () => {
  let provider: ECPayProvider;
  let configService: ConfigService;
  
  const mockCredentials = {
    merchantId: '2000132',
    hashKey: '5294y06JbISpM5x9',
    hashIV: 'v77hoKGq4kWxNNIS',
    environment: 'development' as const,
  };

  const mockPaymentRequest: PaymentRequest = {
    organizerId: 'org-1',
    resourceType: 'event',
    resourceId: 'event-1',
    amount: 1000,
    currency: 'TWD',
    description: 'Test Event Registration',
    paymentMethod: 'Credit',
  };

  const mockPayment: Payment = {
    id: 'payment-1',
    organizerId: 'org-1',
    resourceType: 'event',
    resourceId: 'event-1',
    providerId: 'ecpay',
    merchantTradeNo: 'PAY123456789',
    amount: 1000,
    discountAmount: 0,
    finalAmount: 1000,
    currency: 'TWD',
    paymentMethod: 'Credit',
    status: 'pending',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    organizer: null as any,
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
                  return 'http://localhost:3000';
                case 'CLIENT_BASE_URL':
                  return 'http://localhost:3001';
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

  describe('providerId', () => {
    it('should return ecpay as provider ID', () => {
      expect(provider.providerId).toBe('ecpay');
    });
  });

  describe('validateCredentials', () => {
    it('should validate correct credentials', async () => {
      const result = await provider.validateCredentials(mockCredentials);
      expect(result).toBe(true);
    });

    it('should reject invalid merchant ID', async () => {
      const invalidCredentials = { ...mockCredentials, merchantId: '' };
      const result = await provider.validateCredentials(invalidCredentials);
      expect(result).toBe(false);
    });

    it('should reject invalid hash key', async () => {
      const invalidCredentials = { ...mockCredentials, hashKey: '' };
      const result = await provider.validateCredentials(invalidCredentials);
      expect(result).toBe(false);
    });

    it('should reject invalid hash IV', async () => {
      const invalidCredentials = { ...mockCredentials, hashIV: '' };
      const result = await provider.validateCredentials(invalidCredentials);
      expect(result).toBe(false);
    });

    it('should validate numeric merchant ID format', async () => {
      const numericCredentials = { ...mockCredentials, merchantId: '1234567' };
      const result = await provider.validateCredentials(numericCredentials);
      expect(result).toBe(true);

      const nonNumericCredentials = { ...mockCredentials, merchantId: 'abc123' };
      const nonNumericResult = await provider.validateCredentials(nonNumericCredentials);
      expect(nonNumericResult).toBe(false);
    });
  });

  describe('createPayment', () => {
    it('should create payment with correct ECPay parameters', async () => {
      const result = await provider.createPayment(
        mockPaymentRequest,
        mockPayment,
        mockCredentials,
        {
          callbackUrl: 'https://test.com/callback',
          returnUrl: 'https://test.com/return',
        }
      );

      expect(result.paymentId).toBe(mockPayment.id);
      expect(result.status).toBe('requires_action');
      expect(result.redirectUrl).toContain('payment.ecpay.com.tw');
      expect(result.amount).toBe(mockPaymentRequest.amount);
      expect(result.currency).toBe(mockPaymentRequest.currency);
      expect(result.merchantTradeNo).toBe(mockPayment.merchantTradeNo);
    });

    it('should use production URL for production environment', async () => {
      const productionCredentials = { ...mockCredentials, environment: 'production' as const };
      
      const result = await provider.createPayment(
        mockPaymentRequest,
        mockPayment,
        productionCredentials,
        {
          callbackUrl: 'https://test.com/callback',
          returnUrl: 'https://test.com/return',
        }
      );

      expect(result.redirectUrl).toContain('payment.ecpay.com.tw');
      expect(result.redirectUrl).not.toContain('payment-stage.ecpay.com.tw');
    });

    it('should use staging URL for development environment', async () => {
      const result = await provider.createPayment(
        mockPaymentRequest,
        mockPayment,
        mockCredentials,
        {
          callbackUrl: 'https://test.com/callback',
          returnUrl: 'https://test.com/return',
        }
      );

      expect(result.redirectUrl).toContain('payment-stage.ecpay.com.tw');
    });

    it('should generate correct CheckMacValue', async () => {
      const result = await provider.createPayment(
        mockPaymentRequest,
        mockPayment,
        mockCredentials,
        {
          callbackUrl: 'https://test.com/callback',
          returnUrl: 'https://test.com/return',
        }
      );

      // Verify that the form data includes CheckMacValue
      expect(result.formData).toHaveProperty('CheckMacValue');
      expect(typeof result.formData.CheckMacValue).toBe('string');
      expect(result.formData.CheckMacValue.length).toBeGreaterThan(0);
    });

    it('should include all required ECPay parameters', async () => {
      const result = await provider.createPayment(
        mockPaymentRequest,
        mockPayment,
        mockCredentials,
        {
          callbackUrl: 'https://test.com/callback',
          returnUrl: 'https://test.com/return',
        }
      );

      const formData = result.formData;
      expect(formData).toHaveProperty('MerchantID', mockCredentials.merchantId);
      expect(formData).toHaveProperty('MerchantTradeNo', mockPayment.merchantTradeNo);
      expect(formData).toHaveProperty('TotalAmount', mockPayment.finalAmount.toString());
      expect(formData).toHaveProperty('TradeDesc', mockPaymentRequest.description);
      expect(formData).toHaveProperty('PaymentType', 'aio');
      expect(formData).toHaveProperty('ChoosePayment', 'Credit');
      expect(formData).toHaveProperty('ReturnURL');
      expect(formData).toHaveProperty('OrderResultURL');
      expect(formData).toHaveProperty('CheckMacValue');
    });
  });

  describe('validateCallback', () => {
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

    it('should validate correct callback signature', async () => {
      // Mock the hash generation to return expected value
      const originalGenerateCheckMacValue = (provider as any).generateCheckMacValue;
      (provider as any).generateCheckMacValue = jest.fn().mockReturnValue('valid-test-hash');

      const result = await provider.validateCallback(mockCallbackData, mockCredentials);
      expect(result).toBe(true);

      // Restore original method
      (provider as any).generateCheckMacValue = originalGenerateCheckMacValue;
    });

    it('should reject callback with invalid signature', async () => {
      const invalidCallbackData = { ...mockCallbackData, CheckMacValue: 'invalid-hash' };
      
      const result = await provider.validateCallback(invalidCallbackData, mockCredentials);
      expect(result).toBe(false);
    });

    it('should reject callback with missing required fields', async () => {
      const incompleteCallbackData = { ...mockCallbackData };
      delete incompleteCallbackData.MerchantTradeNo;
      
      const result = await provider.validateCallback(incompleteCallbackData, mockCredentials);
      expect(result).toBe(false);
    });

    it('should validate merchant ID matches credentials', async () => {
      const wrongMerchantCallback = { ...mockCallbackData, MerchantID: '9999999' };
      
      const result = await provider.validateCallback(wrongMerchantCallback, mockCredentials);
      expect(result).toBe(false);
    });
  });

  describe('processCallback', () => {
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

    it('should process successful payment callback', async () => {
      const result = await provider.processCallback(mockCallbackData, mockPayment);

      expect(result.paymentId).toBe(mockPayment.id);
      expect(result.status).toBe('completed');
      expect(result.providerTransactionId).toBe(mockCallbackData.TradeNo);
      expect(result.providerResponse).toEqual(mockCallbackData);
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
      expect(result.providerResponse).toEqual(failedCallbackData);
    });

    it('should handle unknown return codes', async () => {
      const unknownCallbackData = {
        ...mockCallbackData,
        RtnCode: '999',
        RtnMsg: 'UNKNOWN_ERROR',
      };

      const result = await provider.processCallback(unknownCallbackData, mockPayment);

      expect(result.paymentId).toBe(mockPayment.id);
      expect(result.status).toBe('failed');
      expect(result.providerTransactionId).toBe(mockCallbackData.TradeNo);
      expect(result.providerResponse).toEqual(unknownCallbackData);
    });

    it('should include payment metadata in response', async () => {
      const result = await provider.processCallback(mockCallbackData, mockPayment);

      expect(result.metadata).toBeDefined();
      expect(result.metadata).toHaveProperty('paymentType', mockCallbackData.PaymentType);
      expect(result.metadata).toHaveProperty('paymentDate', mockCallbackData.PaymentDate);
      expect(result.metadata).toHaveProperty('chargeFee', mockCallbackData.PaymentTypeChargeFee);
    });
  });

  describe('generateCheckMacValue', () => {
    it('should generate consistent hash for same input', () => {
      const testData = {
        MerchantID: '2000132',
        MerchantTradeNo: 'TEST123456789',
        TotalAmount: '1000',
      };

      const hash1 = (provider as any).generateCheckMacValue(testData, mockCredentials);
      const hash2 = (provider as any).generateCheckMacValue(testData, mockCredentials);

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

      const hash1 = (provider as any).generateCheckMacValue(testData1, mockCredentials);
      const hash2 = (provider as any).generateCheckMacValue(testData2, mockCredentials);

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

      const hash1 = (provider as any).generateCheckMacValue(testDataWithHash, mockCredentials);
      const hash2 = (provider as any).generateCheckMacValue(testDataWithoutHash, mockCredentials);

      expect(hash1).toBe(hash2);
    });
  });

  describe('error handling', () => {
    it('should handle invalid credentials gracefully', async () => {
      const invalidCredentials = {
        merchantId: '',
        hashKey: '',
        hashIV: '',
        environment: 'development' as const,
      };

      await expect(
        provider.createPayment(mockPaymentRequest, mockPayment, invalidCredentials, {})
      ).rejects.toThrow();
    });

    it('should handle malformed callback data', async () => {
      const malformedData = {
        // Missing required fields
        RtnCode: '1',
      };

      const result = await provider.validateCallback(malformedData, mockCredentials);
      expect(result).toBe(false);
    });

    it('should handle empty callback data', async () => {
      const result = await provider.validateCallback({}, mockCredentials);
      expect(result).toBe(false);
    });
  });

  describe('URL encoding', () => {
    it('should properly URL encode special characters in parameters', async () => {
      const specialCharRequest = {
        ...mockPaymentRequest,
        description: 'Test Event with Special Chars: 中文 & symbols!',
      };

      const result = await provider.createPayment(
        specialCharRequest,
        mockPayment,
        mockCredentials,
        {
          callbackUrl: 'https://test.com/callback',
          returnUrl: 'https://test.com/return',
        }
      );

      expect(result.formData.TradeDesc).toBe(specialCharRequest.description);
    });
  });

  describe('environment configuration', () => {
    it('should use correct API endpoints for each environment', async () => {
      // Test development environment
      const devResult = await provider.createPayment(
        mockPaymentRequest,
        mockPayment,
        { ...mockCredentials, environment: 'development' },
        {}
      );
      expect(devResult.redirectUrl).toContain('payment-stage.ecpay.com.tw');

      // Test production environment
      const prodResult = await provider.createPayment(
        mockPaymentRequest,
        mockPayment,
        { ...mockCredentials, environment: 'production' },
        {}
      );
      expect(prodResult.redirectUrl).toContain('payment.ecpay.com.tw');
    });
  });
});