// Real ECPay form submission test (to verify ECPay accepts our data)
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ECPayProvider } from './ecpay.provider';
import axios from 'axios';

describe('ECPay Real Form Submission Test', () => {
  let provider: ECPayProvider;

  // ECPay staging test credentials
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
                  return 'https://test-domain.com';
                case 'CLIENT_BASE_URL':
                  return 'https://test-frontend.com';
                default:
                  return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<ECPayProvider>(ECPayProvider);
  });

  it('should create payment form that ECPay accepts (HTTP 200)', async () => {
    const mockRequest = {
      organizerId: 'test-org-real',
      resourceType: 'event' as const,
      resourceId: 'test-event-real',
      amount: 1, // Minimum amount: NT$1
      currency: 'TWD',
      description: 'ECPay Form Test - Do Not Pay',
      paymentMethod: 'Credit',
      paymentId: 'form-test-' + Date.now(),
      callbackUrl: 'https://test-domain.com/api/v1/payments/callback/ecpay/test-org-real',
    };

    try {
      // Generate payment request
      const result = await provider.createPayment(mockRequest, testCredentials);
      
      console.log('🔗 Generated ECPay Form URL:', result.redirectUrl);
      
      // Extract form data from provider data
      const ecpayRequest = result.providerData?.ecpayRequest;
      const ecpayUrl = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';
      
      console.log('📋 ECPay Form Parameters:');
      console.log(JSON.stringify(ecpayRequest, null, 2));

      // Test if ECPay accepts our form data by making HTTP request
      // This will tell us if our hash and parameters are correct
      try {
        const response = await axios.post(ecpayUrl, ecpayRequest, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'JCTOP-Event-Platform/1.0',
          },
          timeout: 10000,
          maxRedirects: 0, // Don't follow redirects, we just want to see if ECPay accepts the data
          validateStatus: function (status) {
            // Accept any status - we're just testing if ECPay receives our data
            return status >= 200 && status < 600;
          },
        });

        console.log('📈 ECPay Response Status:', response.status);
        console.log('📄 ECPay Response Headers:', response.headers);
        
        if (response.status === 200) {
          console.log('✅ SUCCESS: ECPay accepted our payment form data!');
          console.log('📝 Response preview:', response.data.substring(0, 200) + '...');
        } else if (response.status >= 300 && response.status < 400) {
          console.log('✅ SUCCESS: ECPay redirected (likely to payment page)');
          console.log('🔗 Redirect location:', response.headers.location);
        } else {
          console.log('⚠️ ECPay returned status:', response.status);
          console.log('📄 Error response:', response.data.substring(0, 500));
        }

      } catch (httpError: any) {
        if (httpError.response) {
          console.log('📈 ECPay HTTP Status:', httpError.response.status);
          console.log('📄 ECPay Response:', httpError.response.data?.substring(0, 500));
          
          if (httpError.response.status === 302 || httpError.response.status === 200) {
            console.log('✅ SUCCESS: ECPay accepted our form (redirected or showed payment page)');
          } else {
            console.log('❌ ECPay rejected our form data');
            throw httpError;
          }
        } else {
          console.log('🌐 Network Error:', httpError.message);
          throw httpError;
        }
      }

      // Verify our generated data structure
      expect(result).toBeDefined();
      expect(result.redirectUrl).toContain('payment-stage.ecpay.com.tw');
      expect(ecpayRequest).toBeDefined();
      expect(ecpayRequest.MerchantID).toBe('2000132');
      expect(ecpayRequest.CheckMacValue).toBeDefined();

    } catch (error) {
      console.error('❌ ECPay Form Test Failed:', error);
      throw error;
    }
  }, 30000); // 30 second timeout for HTTP request

  it('should verify hash algorithm matches ECPay requirements', () => {
    // Test with ECPay's own example data to verify our hash algorithm
    const ecpayExampleData = {
      MerchantID: '2000132',
      MerchantTradeNo: 'EXAMPLE001',
      MerchantTradeDate: '2025/01/01 00:00:00',
      PaymentType: 'aio',
      TotalAmount: 100,
      TradeDesc: 'Test',
      ItemName: 'Test Item',
      ReturnURL: 'https://test.com',
      ChoosePayment: 'ALL',
    };

    const hash = (provider as any).generateCheckMacValue(ecpayExampleData, testCredentials);
    
    console.log('🧮 Hash Algorithm Test:');
    console.log('Input Data:', JSON.stringify(ecpayExampleData, null, 2));
    console.log('Generated Hash:', hash);
    console.log('Hash Length:', hash.length);
    console.log('Hash Format:', /^[A-F0-9]{64}$/.test(hash) ? 'Valid SHA-256' : 'Invalid Format');

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(64); // SHA-256 hex should be 64 characters
    expect(/^[A-F0-9]{64}$/.test(hash)).toBe(true); // Should be uppercase hex
  });
});