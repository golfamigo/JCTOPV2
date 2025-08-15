import { ErrorService } from './errorService';
import {
  ErrorCategory,
  ErrorSeverity,
  createNetworkError,
  createValidationError,
  createAuthenticationError,
  createPaymentError,
} from '../constants/errorTypes';
import { Alert } from 'react-native';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('ErrorService', () => {
  let errorService: ErrorService;

  beforeEach(() => {
    // Reset singleton instance
    (ErrorService as any).instance = undefined;
    errorService = ErrorService.getInstance();
    jest.clearAllMocks();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('Singleton Pattern', () => {
    it('returns the same instance', () => {
      const instance1 = ErrorService.getInstance();
      const instance2 = ErrorService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('maintains state across getInstance calls', () => {
      const instance1 = ErrorService.getInstance();
      instance1.setUser('test-user');
      
      const instance2 = ErrorService.getInstance();
      const context = instance2.getContext();
      
      expect(context.userId).toBe('test-user');
    });
  });

  describe('Context Management', () => {
    it('initializes with context', () => {
      errorService.initialize({
        environment: 'test',
        version: '1.0.0',
        metadata: { feature: 'testing' },
      });

      const context = errorService.getContext();
      expect(context.environment).toBe('test');
      expect(context.version).toBe('1.0.0');
      expect(context.metadata?.feature).toBe('testing');
    });

    it('sets user context', () => {
      errorService.setUser('user-123', { role: 'organizer' });

      const context = errorService.getContext();
      expect(context.userId).toBe('user-123');
      expect(context.metadata?.role).toBe('organizer');
    });

    it('clears user context', () => {
      errorService.setUser('user-123');
      errorService.clearUser();

      const context = errorService.getContext();
      expect(context.userId).toBeUndefined();
    });
  });

  describe('Breadcrumb Management', () => {
    it('adds breadcrumbs', () => {
      errorService.addBreadcrumb('user', 'clicked login button', { buttonId: 'login-btn' });
      errorService.addBreadcrumb('navigation', 'navigated to events page');

      const breadcrumbs = errorService.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0].category).toBe('user');
      expect(breadcrumbs[0].message).toBe('clicked login button');
      expect(breadcrumbs[1].category).toBe('navigation');
    });

    it('limits breadcrumbs to maxBreadcrumbs', () => {
      for (let i = 0; i < 60; i++) {
        errorService.addBreadcrumb('test', `breadcrumb ${i}`);
      }

      const breadcrumbs = errorService.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(50); // maxBreadcrumbs default
      expect(breadcrumbs[0].message).toBe('breadcrumb 10'); // First 10 should be removed
    });

    it('clears breadcrumbs', () => {
      errorService.addBreadcrumb('test', 'test breadcrumb');
      errorService.clearBreadcrumbs();

      const breadcrumbs = errorService.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('handles network errors', () => {
      const error = createNetworkError('Connection failed', 'NETWORK_ERROR');
      const handled = errorService.handleError(error);

      expect(handled.category).toBe(ErrorCategory.NETWORK);
      expect(handled.message).toBe('Connection failed');
      expect(console.error).toHaveBeenCalledWith('[NetworkError]', error);
    });

    it('handles validation errors', () => {
      const error = createValidationError('Email is invalid', 'email');
      const handled = errorService.handleError(error);

      expect(handled.category).toBe(ErrorCategory.VALIDATION);
      expect(handled.field).toBe('email');
      expect(console.warn).toHaveBeenCalledWith('[ValidationError]', error);
    });

    it('handles authentication errors', () => {
      const error = createAuthenticationError('Token expired');
      const handled = errorService.handleError(error);

      expect(handled.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(console.error).toHaveBeenCalledWith('[AuthenticationError]', error);
    });

    it('handles payment errors with critical severity', () => {
      const error = createPaymentError('Payment declined', 'PAYMENT_DECLINED');
      const handled = errorService.handleError(error);

      expect(handled.category).toBe(ErrorCategory.PAYMENT);
      expect(handled.severity).toBe(ErrorSeverity.CRITICAL);
      expect(console.error).toHaveBeenCalledWith('[PaymentError]', error);
    });

    it('handles generic errors', () => {
      const error = new Error('Something went wrong');
      const handled = errorService.handleError(error);

      expect(handled.category).toBe(ErrorCategory.UNKNOWN);
      expect(handled.message).toBe('Something went wrong');
    });

    it('attaches context and breadcrumbs to errors', () => {
      errorService.setUser('user-456');
      errorService.addBreadcrumb('action', 'attempted payment');

      const error = new Error('Payment failed');
      const handled = errorService.handleError(error);

      expect(handled.context?.userId).toBe('user-456');
      expect(handled.breadcrumbs).toHaveLength(1);
      expect(handled.breadcrumbs?.[0].message).toBe('attempted payment');
    });
  });

  describe('Error Reporting', () => {
    it('creates error report with all details', () => {
      errorService.initialize({ environment: 'production' });
      errorService.setUser('user-789');
      errorService.addBreadcrumb('navigation', 'viewed event details');

      const error = createNetworkError('API timeout');
      errorService.handleError(error);

      const report = errorService.createErrorReport(error);

      expect(report.error).toBe(error);
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.context?.environment).toBe('production');
      expect(report.context?.userId).toBe('user-789');
      expect(report.breadcrumbs).toHaveLength(1);
      expect(report.deviceInfo).toBeDefined();
    });

    it('sends error report to backend', async () => {
      const mockSend = jest.fn().mockResolvedValue({ success: true });
      (errorService as any).sendToBackend = mockSend;

      const error = new Error('Test error');
      await errorService.reportError(error);

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({
          message: 'Test error',
        }),
      }));
    });

    it('handles error reporting failure gracefully', async () => {
      const mockSend = jest.fn().mockRejectedValue(new Error('Network error'));
      (errorService as any).sendToBackend = mockSend;

      const error = new Error('Test error');
      await errorService.reportError(error);

      // Should not throw, just log
      expect(console.error).toHaveBeenCalledWith(
        'Failed to report error:',
        expect.any(Error)
      );
    });
  });

  describe('User Feedback', () => {
    it('shows user-friendly error message for network errors', () => {
      const error = createNetworkError('Connection timeout');
      errorService.showUserError(error);

      expect(Alert.alert).toHaveBeenCalledWith(
        '網路錯誤',
        '連線失敗，請檢查網路連線後重試',
        expect.any(Array)
      );
    });

    it('shows user-friendly error message for validation errors', () => {
      const error = createValidationError('Invalid email format', 'email');
      errorService.showUserError(error);

      expect(Alert.alert).toHaveBeenCalledWith(
        '輸入錯誤',
        '請檢查輸入的資料是否正確',
        expect.any(Array)
      );
    });

    it('shows user-friendly error message for authentication errors', () => {
      const error = createAuthenticationError('Session expired');
      errorService.showUserError(error);

      expect(Alert.alert).toHaveBeenCalledWith(
        '認證錯誤',
        '請重新登入',
        expect.any(Array)
      );
    });

    it('shows generic error message for unknown errors', () => {
      const error = new Error('Unknown error');
      errorService.showUserError(error);

      expect(Alert.alert).toHaveBeenCalledWith(
        '錯誤',
        '發生未知錯誤，請稍後再試',
        expect.any(Array)
      );
    });

    it('includes retry callback in error alert', () => {
      const retryCallback = jest.fn();
      const error = createNetworkError('API error');
      
      errorService.showUserError(error, { retry: retryCallback });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const buttons = alertCall[2];
      
      expect(buttons).toHaveLength(2);
      expect(buttons[1].text).toBe('重試');
      
      // Simulate retry button press
      buttons[1].onPress();
      expect(retryCallback).toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    it('implements exponential backoff for retries', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('Success');

      const result = await errorService.retryWithBackoff(operation, 3, 100);

      expect(result).toBe('Success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('throws after max retries exceeded', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Always fails'));

      await expect(
        errorService.retryWithBackoff(operation, 3, 100)
      ).rejects.toThrow('Always fails');

      expect(operation).toHaveBeenCalledTimes(3);
    });
  });

  describe('Traditional Chinese Localization', () => {
    it('returns error messages in Traditional Chinese', () => {
      const messages = {
        networkError: errorService.getLocalizedMessage('NETWORK_ERROR'),
        validationError: errorService.getLocalizedMessage('VALIDATION_ERROR'),
        authError: errorService.getLocalizedMessage('AUTH_ERROR'),
        paymentError: errorService.getLocalizedMessage('PAYMENT_ERROR'),
      };

      expect(messages.networkError).toContain('網路');
      expect(messages.validationError).toContain('驗證');
      expect(messages.authError).toContain('認證');
      expect(messages.paymentError).toContain('付款');
    });
  });
});