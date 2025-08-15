import { ERROR_MESSAGES, getErrorMessage, getErrorMessageByCode } from '../constants/errorMessages';
import {
  AppError,
  ErrorCategory,
  ErrorSeverity,
  ErrorContext,
  ErrorReport,
  ErrorBreadcrumb,
  NetworkError,
  ValidationError,
  createNetworkError,
  createValidationError,
  createAuthenticationError,
  createPaymentError,
  createEventError,
  createPermissionError,
  createFileError,
} from '../constants/errorTypes';

class ErrorService {
  private static instance: ErrorService;
  private errorContext: ErrorContext = {};
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private maxBreadcrumbs = 50;

  private constructor() {}

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Initialize error service with context
   */
  public initialize(context: Partial<ErrorContext>) {
    this.errorContext = { ...this.errorContext, ...context };
  }

  /**
   * Set user context for error tracking
   */
  public setUser(userId: string, metadata?: Record<string, any>) {
    this.errorContext.userId = userId;
    if (metadata) {
      this.errorContext.metadata = { ...this.errorContext.metadata, ...metadata };
    }
  }

  /**
   * Set current screen for error tracking
   */
  public setScreen(screenName: string) {
    this.errorContext.screenName = screenName;
    this.addBreadcrumb('navigation', `Navigated to ${screenName}`);
  }

  /**
   * Add breadcrumb for debugging
   */
  public addBreadcrumb(type: ErrorBreadcrumb['type'], message: string, data?: any) {
    const breadcrumb: ErrorBreadcrumb = {
      timestamp: Date.now(),
      type,
      message,
      data,
    };

    this.breadcrumbs.push(breadcrumb);
    
    // Keep only the latest breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * Map technical error to user-friendly message
   */
  public mapErrorToUserMessage(error: any): string {
    // Handle AppError with userMessage
    if (error.userMessage) {
      return error.userMessage;
    }

    // Handle by error category
    if (error.category) {
      return this.getMessageByCategory(error);
    }

    // Handle by HTTP status code
    if (error.statusCode || error.status) {
      const code = String(error.statusCode || error.status);
      return getErrorMessageByCode(code);
    }

    // Handle by error code
    if (error.code) {
      return this.mapErrorCodeToMessage(error.code);
    }

    // Handle network errors
    if (error.message?.toLowerCase().includes('network')) {
      return ERROR_MESSAGES.network.offline;
    }

    // Handle timeout errors
    if (error.message?.toLowerCase().includes('timeout')) {
      return ERROR_MESSAGES.network.timeout;
    }

    // Default fallback
    return ERROR_MESSAGES.general.somethingWrong;
  }

  /**
   * Get message by error category
   */
  private getMessageByCategory(error: AppError): string {
    switch (error.category) {
      case ErrorCategory.NETWORK:
        return this.getNetworkErrorMessage(error as NetworkError);
      case ErrorCategory.VALIDATION:
        return this.getValidationErrorMessage(error as ValidationError);
      case ErrorCategory.AUTHENTICATION:
        return ERROR_MESSAGES.authentication.loginFailed;
      case ErrorCategory.PAYMENT:
        return ERROR_MESSAGES.payment.failed;
      case ErrorCategory.EVENT:
        return ERROR_MESSAGES.event.notFound;
      case ErrorCategory.PERMISSION:
        return ERROR_MESSAGES.permission.cameradenied;
      case ErrorCategory.FILE:
        return ERROR_MESSAGES.file.uploadFailed;
      case ErrorCategory.SYSTEM:
        return ERROR_MESSAGES.system.maintenance;
      default:
        return ERROR_MESSAGES.general.somethingWrong;
    }
  }

  /**
   * Get network error message based on status code
   */
  private getNetworkErrorMessage(error: NetworkError): string {
    switch (error.statusCode) {
      case 400:
        return ERROR_MESSAGES.validation.invalidFormat;
      case 401:
        return ERROR_MESSAGES.authentication.unauthorized;
      case 403:
        return ERROR_MESSAGES.authentication.unauthorized;
      case 404:
        return ERROR_MESSAGES.network.notFound;
      case 408:
        return ERROR_MESSAGES.network.timeout;
      case 429:
        return ERROR_MESSAGES.warning.limitReached;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.network.serverError;
      default:
        return ERROR_MESSAGES.network.requestFailed;
    }
  }

  /**
   * Get validation error message
   */
  private getValidationErrorMessage(error: ValidationError): string {
    if (error.fields) {
      const fieldNames = Object.keys(error.fields);
      if (fieldNames.length > 0) {
        const firstField = fieldNames[0];
        const errors = error.fields[firstField];
        if (errors && errors.length > 0) {
          return this.mapValidationMessageToUserMessage(errors[0]);
        }
      }
    }
    return ERROR_MESSAGES.validation.invalidFormat;
  }

  /**
   * Map validation message to user-friendly message
   */
  private mapValidationMessageToUserMessage(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('required')) {
      return ERROR_MESSAGES.validation.required;
    }
    if (lowerMessage.includes('email')) {
      return ERROR_MESSAGES.validation.invalidEmail;
    }
    if (lowerMessage.includes('password')) {
      if (lowerMessage.includes('short')) {
        return ERROR_MESSAGES.validation.passwordTooShort;
      }
      if (lowerMessage.includes('weak')) {
        return ERROR_MESSAGES.validation.passwordTooWeak;
      }
      if (lowerMessage.includes('match')) {
        return ERROR_MESSAGES.validation.passwordMismatch;
      }
    }
    if (lowerMessage.includes('phone')) {
      return ERROR_MESSAGES.validation.invalidPhoneNumber;
    }
    if (lowerMessage.includes('date')) {
      return ERROR_MESSAGES.validation.invalidDate;
    }
    if (lowerMessage.includes('amount')) {
      return ERROR_MESSAGES.validation.invalidAmount;
    }
    
    return ERROR_MESSAGES.validation.invalidFormat;
  }

  /**
   * Map error code to user message
   */
  private mapErrorCodeToMessage(code: string): string {
    const codeMap: Record<string, string> = {
      // Network codes
      'ECONNREFUSED': ERROR_MESSAGES.network.serverError,
      'ENOTFOUND': ERROR_MESSAGES.network.offline,
      'ETIMEDOUT': ERROR_MESSAGES.network.timeout,
      'ECONNRESET': ERROR_MESSAGES.network.requestFailed,
      
      // Auth codes
      'AUTH_FAILED': ERROR_MESSAGES.authentication.loginFailed,
      'INVALID_TOKEN': ERROR_MESSAGES.authentication.sessionExpired,
      'UNAUTHORIZED': ERROR_MESSAGES.authentication.unauthorized,
      
      // Payment codes
      'PAYMENT_FAILED': ERROR_MESSAGES.payment.failed,
      'CARD_DECLINED': ERROR_MESSAGES.payment.declined,
      'INSUFFICIENT_FUNDS': ERROR_MESSAGES.payment.insufficientFunds,
      
      // Event codes
      'EVENT_NOT_FOUND': ERROR_MESSAGES.event.notFound,
      'EVENT_FULL': ERROR_MESSAGES.event.full,
      'REGISTRATION_CLOSED': ERROR_MESSAGES.event.registrationClosed,
      
      // File codes
      'FILE_TOO_LARGE': ERROR_MESSAGES.file.sizeTooLarge,
      'INVALID_FILE_TYPE': ERROR_MESSAGES.file.invalidType,
      'UPLOAD_FAILED': ERROR_MESSAGES.file.uploadFailed,
    };

    return codeMap[code] || ERROR_MESSAGES.general.somethingWrong;
  }

  /**
   * Log error for debugging and analytics
   */
  public logError(error: any, errorInfo?: any) {
    const appError = this.normalizeError(error);
    const severity = this.determineSeverity(appError);
    
    const report: ErrorReport = {
      error: appError,
      context: {
        ...this.errorContext,
        breadcrumbs: [...this.breadcrumbs],
      },
      severity,
      timestamp: Date.now(),
    };

    // Log to console in development
    if (__DEV__) {
      console.group(`🔴 Error: ${appError.message}`);
      console.error('Error:', appError);
      console.log('Context:', report.context);
      console.log('Severity:', severity);
      if (errorInfo) {
        console.log('Error Info:', errorInfo);
      }
      console.groupEnd();
    }

    // Send to crash analytics service (e.g., Sentry, Crashlytics)
    this.sendToCrashlytics(report);
    
    // Add error breadcrumb
    this.addBreadcrumb('error', appError.message, { code: appError.code });
  }

  /**
   * Normalize error to AppError format
   */
  private normalizeError(error: any): AppError {
    if (error.category) {
      return error as AppError;
    }

    // Create AppError from regular Error
    const appError: AppError = {
      name: error.name || 'UnknownError',
      message: error.message || 'An unknown error occurred',
      code: error.code,
      statusCode: error.statusCode || error.status,
      category: this.determineCategory(error),
      details: error.details || error.response?.data,
      timestamp: Date.now(),
      stack: error.stack,
    };

    return appError;
  }

  /**
   * Determine error category from error object
   */
  private determineCategory(error: any): ErrorCategory {
    const message = error.message?.toLowerCase() || '';
    const code = error.code?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch') || code.includes('econ')) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes('auth') || message.includes('login') || message.includes('token')) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (message.includes('valid') || error.statusCode === 400) {
      return ErrorCategory.VALIDATION;
    }
    if (message.includes('payment') || message.includes('card') || message.includes('transaction')) {
      return ErrorCategory.PAYMENT;
    }
    if (message.includes('event') || message.includes('ticket') || message.includes('registration')) {
      return ErrorCategory.EVENT;
    }
    if (message.includes('permission') || message.includes('denied')) {
      return ErrorCategory.PERMISSION;
    }
    if (message.includes('file') || message.includes('upload') || message.includes('download')) {
      return ErrorCategory.FILE;
    }
    
    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: AppError): ErrorSeverity {
    // Critical errors
    if (error.category === ErrorCategory.PAYMENT || error.statusCode === 500) {
      return ErrorSeverity.CRITICAL;
    }
    
    // High severity errors
    if (error.category === ErrorCategory.AUTHENTICATION || error.category === ErrorCategory.SYSTEM) {
      return ErrorSeverity.HIGH;
    }
    
    // Medium severity errors
    if (error.category === ErrorCategory.NETWORK || error.category === ErrorCategory.VALIDATION) {
      return ErrorSeverity.MEDIUM;
    }
    
    // Low severity errors
    return ErrorSeverity.LOW;
  }

  /**
   * Send error report to crash analytics service
   */
  private sendToCrashlytics(report: ErrorReport) {
    // TODO: Integrate with crash analytics service
    // Example: Sentry, Crashlytics, Bugsnag, etc.
    
    // For now, just store in memory for debugging
    if (__DEV__) {
      // Could implement local storage or debugging panel
    }
  }

  /**
   * Create error from API response
   */
  public createErrorFromResponse(response: any): AppError {
    const statusCode = response.status || response.statusCode;
    const data = response.data || response;
    
    // Check for standard error response format
    if (data.error) {
      return this.normalizeError({
        ...data.error,
        statusCode,
      });
    }
    
    // Check for validation errors
    if (data.errors && typeof data.errors === 'object') {
      return createValidationError(
        data.message || 'Validation failed',
        data.errors,
        { statusCode }
      );
    }
    
    // Create network error for HTTP errors
    if (statusCode >= 400) {
      return createNetworkError(
        data.message || `Request failed with status ${statusCode}`,
        statusCode,
        { details: data }
      );
    }
    
    // Default error
    return this.normalizeError({
      message: data.message || 'An error occurred',
      statusCode,
      details: data,
    });
  }

  /**
   * Clear error context and breadcrumbs
   */
  public clear() {
    this.errorContext = {};
    this.breadcrumbs = [];
  }
}

export const errorService = ErrorService.getInstance();
export default errorService;