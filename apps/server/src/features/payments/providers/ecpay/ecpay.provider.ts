import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { IPaymentProvider } from '../../interfaces/payment-provider.interface';
import { PaymentRequest, PaymentResponse, Payment, PaymentUpdate, ECPayCredentials } from '@jctop-event/shared-types';

@Injectable()
export class ECPayProvider implements IPaymentProvider {
  readonly providerId = 'ecpay';
  
  // Payment methods from existing implementation
  private readonly paymentMethods = {
    ALL: { code: 'ALL', name: '不指定付款方式' },
    Credit: { code: 'Credit', name: '信用卡' },
    ATM: { code: 'ATM', name: 'ATM轉帳' },
    CVS: { code: 'CVS', name: '超商代碼' },
    BARCODE: { code: 'BARCODE', name: '超商條碼' },
    ApplePay: { code: 'ApplePay', name: 'Apple Pay' },
    GooglePay: { code: 'GooglePay', name: 'Google Pay' }
  };

  constructor(private configService: ConfigService) {}

  async validateCredentials(credentials: ECPayCredentials): Promise<boolean> {
    // Validate ECPay credential format
    const required = ['merchantId', 'hashKey', 'hashIV', 'environment'];
    for (const field of required) {
      if (!credentials[field]) return false;
    }
    
    // Validate merchant ID format (should be numeric)
    if (!/^\d+$/.test(credentials.merchantId)) {
      return false;
    }
    
    // Validate hash key and IV format (should be alphanumeric)
    if (!/^[A-Za-z0-9]+$/.test(credentials.hashKey) || 
        !/^[A-Za-z0-9]+$/.test(credentials.hashIV)) {
      return false;
    }
    
    // Validate environment
    if (!['development', 'production'].includes(credentials.environment)) {
      return false;
    }

    // TODO: Add actual ECPay API test call to validate credentials
    return true;
  }

  async createPayment(
    request: PaymentRequest & { paymentId: string; callbackUrl: string },
    credentials: ECPayCredentials
  ): Promise<PaymentResponse> {
    // Generate merchant trade number
    const merchantTradeNo = this.generateMerchantTradeNo(request.paymentId);
    
    // Validate amount (ECPay requirements)
    if (request.amount < 1 || request.amount > 99999999) {
      throw new Error('交易金額必須在 1 到 99,999,999 之間');
    }
    
    // Build ECPay request parameters
    const ecpayRequest: any = {
      MerchantID: credentials.merchantId,
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: this.formatDate(new Date()),
      PaymentType: 'aio',
      TotalAmount: Math.floor(request.amount), // ECPay requires integer
      TradeDesc: request.description.substring(0, 200), // ECPay limit
      ItemName: request.description.substring(0, 200), // ECPay limit
      ReturnURL: request.callbackUrl,
      ChoosePayment: request.paymentMethod || 'ALL',
    };

    // Generate CheckMacValue
    ecpayRequest.CheckMacValue = this.generateCheckMacValue(ecpayRequest, credentials);

    return {
      paymentId: request.paymentId,
      status: 'requires_action',
      redirectUrl: this.buildECPayUrl(ecpayRequest, credentials.environment),
      amount: request.amount,
      currency: request.currency,
      providerData: { 
        ecpayRequest,
        formData: { 
          action: this.getECPayUrl(credentials.environment), 
          params: ecpayRequest 
        }
      }
    };
  }

  async validateCallback(callbackData: any, credentials: ECPayCredentials): Promise<boolean> {
    // Validate required callback fields
    if (!callbackData.MerchantTradeNo || !callbackData.CheckMacValue) {
      return false;
    }
    
    // Generate expected hash
    const expectedHash = this.generateCallbackHash(callbackData, credentials);
    return expectedHash === callbackData.CheckMacValue;
  }

  async processCallback(callbackData: any, payment: Payment): Promise<PaymentUpdate> {
    // Map ECPay status to our payment status
    let status: PaymentUpdate['status'] = 'failed';
    if (callbackData.RtnCode === '1' || callbackData.RtnCode === 1) {
      status = 'completed';
    } else if (callbackData.RtnCode === '0' || callbackData.RtnCode === 0) {
      status = 'cancelled';
    }
    
    return {
      paymentId: payment.id,
      status,
      providerTransactionId: callbackData.TradeNo,
      providerResponse: {
        ...callbackData,
        paymentTypeName: this.getPaymentTypeName(callbackData.PaymentType)
      }
    };
  }
  
  // Helper methods
  private generateMerchantTradeNo(_paymentId: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY${timestamp.slice(-8)}${random}`.substring(0, 20);
  }
  
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
  }
  
  private getECPayUrl(environment: 'development' | 'production'): string {
    const urls = {
      production: this.configService.get('ECPAY_PRODUCTION_URL') || 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5',
      development: this.configService.get('ECPAY_STAGING_URL') || 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
    };
    return urls[environment] || urls.development;
  }
  
  private buildECPayUrl(ecpayRequest: any, environment: 'development' | 'production'): string {
    const baseUrl = this.getECPayUrl(environment);
    const params = new URLSearchParams(ecpayRequest).toString();
    return `${baseUrl}?${params}`;
  }
  
  private generateCheckMacValue(data: any, credentials: ECPayCredentials): string {
    // Remove CheckMacValue if it exists
    const { CheckMacValue: _unused, ...dataForHash } = data;
    
    // Sort parameters by key
    const sortedParams = Object.keys(dataForHash)
      .sort()
      .map(key => `${key}=${dataForHash[key]}`)
      .join('&');
    
    // Build hash string with hash key and IV
    const hashString = `HashKey=${credentials.hashKey}&${sortedParams}&HashIV=${credentials.hashIV}`;
    
    // URL encode and generate SHA256 hash
    const encoded = encodeURIComponent(hashString)
      .replace(/%20/g, '+')
      .replace(/'/g, '%27')
      .replace(/!/g, '%21')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
    
    return crypto.createHash('sha256').update(encoded.toLowerCase()).digest('hex').toUpperCase();
  }
  
  private generateCallbackHash(callbackData: any, credentials: ECPayCredentials): string {
    // Remove CheckMacValue for validation
    const { CheckMacValue: _unused, ...dataForHash } = callbackData;
    return this.generateCheckMacValue(dataForHash, credentials);
  }
  
  private getPaymentTypeName(paymentType: string): string {
    const paymentTypes: Record<string, string> = {
      'Credit_CreditCard': '信用卡',
      'ATM_LAND': 'ATM轉帳',
      'CVS_CVS': '超商代碼',
      'BARCODE_BARCODE': '超商條碼',
      'WebATM_TAISHIN': '網路ATM',
      'ApplePay': 'Apple Pay',
      'GooglePay': 'Google Pay'
    };
    return paymentTypes[paymentType] || paymentType;
  }
}