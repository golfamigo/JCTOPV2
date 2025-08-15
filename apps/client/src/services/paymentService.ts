import { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentStatusResponse, 
  PaymentProviderDto,
  UpdatePaymentProviderDto,
  PaymentProvider
} from '@jctop-event/shared-types';
import apiClient from './apiClient';

class PaymentService {
  // Payment Gateway Service endpoints
  async initiatePayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>('/payments/initiate', paymentRequest);
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    return apiClient.get<PaymentStatusResponse>(`/payments/${paymentId}/status`);
  }

  // Event-specific payment endpoints
  async initiateEventPayment(
    eventId: string, 
    paymentData: {
      amount: number;
      description: string;
      paymentMethod?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>(`/events/${eventId}/payments/initiate`, paymentData);
  }

  // Payment Provider Management endpoints
  async getPaymentProviders(): Promise<PaymentProvider[]> {
    return apiClient.get<PaymentProvider[]>('/organizers/me/payment-providers');
  }

  async addPaymentProvider(provider: PaymentProviderDto): Promise<PaymentProvider> {
    return apiClient.post<PaymentProvider>('/organizers/me/payment-providers', provider);
  }

  async updatePaymentProvider(providerId: string, updates: UpdatePaymentProviderDto): Promise<PaymentProvider> {
    return apiClient.put<PaymentProvider>(`/organizers/me/payment-providers/${providerId}`, updates);
  }

  async setDefaultPaymentProvider(providerId: string): Promise<{ success: boolean }> {
    return apiClient.put<{ success: boolean }>(`/organizers/me/payment-providers/${providerId}/default`);
  }

  async removePaymentProvider(providerId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/organizers/me/payment-providers/${providerId}`);
  }

  // Additional provider management methods
  async activateProvider(providerId: string): Promise<PaymentProvider> {
    return apiClient.put<PaymentProvider>(`/organizers/me/payment-providers/${providerId}/activate`);
  }

  async deactivateProvider(providerId: string): Promise<PaymentProvider> {
    return apiClient.put<PaymentProvider>(`/organizers/me/payment-providers/${providerId}/deactivate`);
  }

  async deleteProvider(providerId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/organizers/me/payment-providers/${providerId}`);
  }

  async createProvider(providerData: PaymentProviderDto): Promise<PaymentProvider> {
    return apiClient.post<PaymentProvider>('/organizers/me/payment-providers', providerData);
  }

  async updateProviderCredentials(providerId: string, credentials: any): Promise<PaymentProvider> {
    return apiClient.put<PaymentProvider>(`/organizers/me/payment-providers/${providerId}/credentials`, credentials);
  }

  // Utility methods for payment display
  formatAmount(amount: number, currency = 'TWD'): string {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount);
  }

  getPaymentStatusText(status: string): string {
    const statusTexts: Record<string, string> = {
      'pending': '處理中',
      'requires_action': '需要操作',
      'processing': '處理中',
      'completed': '支付成功',
      'failed': '支付失敗',
      'cancelled': '支付取消',
      'refunded': '已退款'
    };
    return statusTexts[status] || '未知狀態';
  }

  async testCredentials(providerId: string, credentials: any): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message?: string }>(
        `/payment-providers/test`,
        { providerId, credentials }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to test credentials'
      };
    }
  }

  async createPaymentProvider(data: PaymentProviderDto): Promise<PaymentProvider> {
    return await apiClient.post<PaymentProvider>('/payment-providers', data);
  }

  getPaymentStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'pending': '#FF9800',
      'requires_action': '#FF9800',
      'processing': '#FF9800',
      'completed': '#4CAF50',
      'failed': '#F44336',
      'cancelled': '#9E9E9E',
      'refunded': '#2196F3'
    };
    return statusColors[status] || '#9E9E9E';
  }

  // ECPay-specific helper methods
  getECPayPaymentMethods(): Array<{ code: string; name: string }> {
    return [
      { code: 'ALL', name: '不指定付款方式' },
      { code: 'Credit', name: '信用卡' },
      { code: 'ATM', name: 'ATM轉帳' },
      { code: 'CVS', name: '超商代碼' },
      { code: 'BARCODE', name: '超商條碼' },
      { code: 'ApplePay', name: 'Apple Pay' },
      { code: 'GooglePay', name: 'Google Pay' }
    ];
  }

  getPaymentMethodName(paymentType: string): string {
    const paymentTypes: Record<string, string> = {
      'Credit_CreditCard': '信用卡',
      'ATM_LAND': 'ATM轉帳',
      'CVS_CVS': '超商代碼',
      'BARCODE_BARCODE': '超商條碼',
      'WebATM_TAISHIN': '網路ATM',
      'ApplePay': 'Apple Pay',
      'GooglePay': 'Google Pay',
      'ALL': '不指定付款方式',
      'Credit': '信用卡',
      'ATM': 'ATM轉帳',
      'CVS': '超商代碼',
      'BARCODE': '超商條碼'
    };
    return paymentTypes[paymentType] || paymentType;
  }

  // Payment validation helpers
  validateAmount(amount: number): { valid: boolean; message?: string } {
    if (amount < 1) {
      return { valid: false, message: '金額必須大於 0' };
    }
    if (amount > 99999999) {
      return { valid: false, message: '金額不能超過 99,999,999' };
    }
    return { valid: true };
  }

  validateECPayCredentials(credentials: {
    merchantId: string;
    hashKey: string;
    hashIV: string;
    environment: string;
  }): { valid: boolean; message?: string } {
    if (!credentials.merchantId || !/^\d+$/.test(credentials.merchantId)) {
      return { valid: false, message: '商店代號必須為數字' };
    }
    if (!credentials.hashKey || !/^[A-Za-z0-9]+$/.test(credentials.hashKey)) {
      return { valid: false, message: 'HashKey 格式不正確' };
    }
    if (!credentials.hashIV || !/^[A-Za-z0-9]+$/.test(credentials.hashIV)) {
      return { valid: false, message: 'HashIV 格式不正確' };
    }
    if (!['development', 'production'].includes(credentials.environment)) {
      return { valid: false, message: '環境設定不正確' };
    }
    return { valid: true };
  }

  // Payment polling helper for real-time status updates
  async pollPaymentStatus(
    paymentId: string, 
    callback: (status: PaymentStatusResponse) => void,
    intervalMs: number = 3000,
    maxAttempts: number = 60
  ): Promise<void> {
    let attempts = 0;
    
    const poll = async () => {
      try {
        const status = await this.getPaymentStatus(paymentId);
        callback(status);
        
        // Stop polling if payment is complete or failed
        if (['completed', 'failed', 'cancelled', 'refunded'].includes(status.status)) {
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs);
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs);
        }
      }
    };
    
    poll();
  }
}

const paymentService = new PaymentService();
export default paymentService;