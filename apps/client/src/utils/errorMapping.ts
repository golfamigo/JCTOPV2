import { ERROR_MESSAGES } from '../constants/errorMessages';
import { ErrorCategory } from '../constants/errorTypes';

/**
 * Map technical errors to user-friendly messages
 */
export const errorMapping = {
  /**
   * Map HTTP status code to message
   */
  mapStatusCode: (statusCode: number): string => {
    const statusMessages: Record<number, string> = {
      400: ERROR_MESSAGES.validation.invalidFormat,
      401: ERROR_MESSAGES.authentication.unauthorized,
      403: ERROR_MESSAGES.authentication.unauthorized,
      404: ERROR_MESSAGES.network.notFound,
      408: ERROR_MESSAGES.network.timeout,
      429: ERROR_MESSAGES.warning.limitReached,
      500: ERROR_MESSAGES.system.maintenance,
      502: ERROR_MESSAGES.network.badGateway,
      503: ERROR_MESSAGES.network.serviceUnavailable,
    };

    return statusMessages[statusCode] || ERROR_MESSAGES.general.somethingWrong;
  },

  /**
   * Map error code to message
   */
  mapErrorCode: (code: string): string => {
    const codeMessages: Record<string, string> = {
      // Network errors
      'ECONNREFUSED': ERROR_MESSAGES.network.serverError,
      'ENOTFOUND': ERROR_MESSAGES.network.offline,
      'ETIMEDOUT': ERROR_MESSAGES.network.timeout,
      'ECONNRESET': ERROR_MESSAGES.network.requestFailed,
      'NETWORK_ERROR': ERROR_MESSAGES.network.offline,
      
      // Auth errors
      'AUTH_FAILED': ERROR_MESSAGES.authentication.loginFailed,
      'INVALID_TOKEN': ERROR_MESSAGES.authentication.sessionExpired,
      'UNAUTHORIZED': ERROR_MESSAGES.authentication.unauthorized,
      'ACCOUNT_LOCKED': ERROR_MESSAGES.authentication.accountLocked,
      'ACCOUNT_NOT_FOUND': ERROR_MESSAGES.authentication.accountNotFound,
      'EMAIL_NOT_VERIFIED': ERROR_MESSAGES.authentication.emailNotVerified,
      
      // Validation errors
      'VALIDATION_ERROR': ERROR_MESSAGES.validation.invalidFormat,
      'REQUIRED_FIELD': ERROR_MESSAGES.validation.required,
      'INVALID_EMAIL': ERROR_MESSAGES.validation.invalidEmail,
      'PASSWORD_TOO_SHORT': ERROR_MESSAGES.validation.passwordTooShort,
      'PASSWORD_TOO_WEAK': ERROR_MESSAGES.validation.passwordTooWeak,
      'PASSWORD_MISMATCH': ERROR_MESSAGES.validation.passwordMismatch,
      'DUPLICATE_ENTRY': ERROR_MESSAGES.validation.duplicateEntry,
      
      // Payment errors
      'PAYMENT_FAILED': ERROR_MESSAGES.payment.failed,
      'CARD_DECLINED': ERROR_MESSAGES.payment.declined,
      'INSUFFICIENT_FUNDS': ERROR_MESSAGES.payment.insufficientFunds,
      'CARD_EXPIRED': ERROR_MESSAGES.payment.cardExpired,
      'INVALID_CARD': ERROR_MESSAGES.payment.invalidCard,
      'PAYMENT_TIMEOUT': ERROR_MESSAGES.payment.timeout,
      
      // Event errors
      'EVENT_NOT_FOUND': ERROR_MESSAGES.event.notFound,
      'EVENT_EXPIRED': ERROR_MESSAGES.event.expired,
      'EVENT_CANCELLED': ERROR_MESSAGES.event.cancelled,
      'EVENT_FULL': ERROR_MESSAGES.event.full,
      'REGISTRATION_CLOSED': ERROR_MESSAGES.event.registrationClosed,
      'ALREADY_REGISTERED': ERROR_MESSAGES.event.alreadyRegistered,
      'TICKET_UNAVAILABLE': ERROR_MESSAGES.event.ticketUnavailable,
      'INVALID_DISCOUNT_CODE': ERROR_MESSAGES.event.invalidDiscountCode,
      
      // File errors
      'FILE_TOO_LARGE': ERROR_MESSAGES.file.sizeTooLarge,
      'INVALID_FILE_TYPE': ERROR_MESSAGES.file.invalidType,
      'UPLOAD_FAILED': ERROR_MESSAGES.file.uploadFailed,
      'DOWNLOAD_FAILED': ERROR_MESSAGES.file.downloadFailed,
      'FILE_NOT_FOUND': ERROR_MESSAGES.file.notFound,
      
      // Permission errors
      'CAMERA_PERMISSION_DENIED': ERROR_MESSAGES.permission.cameradenied,
      'LOCATION_PERMISSION_DENIED': ERROR_MESSAGES.permission.locationDenied,
      'NOTIFICATION_PERMISSION_DENIED': ERROR_MESSAGES.permission.notificationDenied,
      'STORAGE_PERMISSION_DENIED': ERROR_MESSAGES.permission.storageDenied,
    };

    return codeMessages[code] || ERROR_MESSAGES.general.somethingWrong;
  },

  /**
   * Map error category to message
   */
  mapCategory: (category: ErrorCategory): string => {
    const categoryMessages: Record<ErrorCategory, string> = {
      [ErrorCategory.NETWORK]: ERROR_MESSAGES.network.requestFailed,
      [ErrorCategory.AUTHENTICATION]: ERROR_MESSAGES.authentication.loginFailed,
      [ErrorCategory.VALIDATION]: ERROR_MESSAGES.validation.invalidFormat,
      [ErrorCategory.PAYMENT]: ERROR_MESSAGES.payment.failed,
      [ErrorCategory.EVENT]: ERROR_MESSAGES.event.notFound,
      [ErrorCategory.USER]: ERROR_MESSAGES.user.profileUpdateFailed,
      [ErrorCategory.FILE]: ERROR_MESSAGES.file.uploadFailed,
      [ErrorCategory.PERMISSION]: ERROR_MESSAGES.permission.cameradenied,
      [ErrorCategory.SYSTEM]: ERROR_MESSAGES.system.maintenance,
      [ErrorCategory.UNKNOWN]: ERROR_MESSAGES.general.somethingWrong,
    };

    return categoryMessages[category] || ERROR_MESSAGES.general.somethingWrong;
  },

  /**
   * Extract user-friendly message from error object
   */
  extractMessage: (error: any): string => {
    // Check for user message
    if (error.userMessage) {
      return error.userMessage;
    }

    // Check for status code
    if (error.statusCode || error.status) {
      return errorMapping.mapStatusCode(error.statusCode || error.status);
    }

    // Check for error code
    if (error.code) {
      return errorMapping.mapErrorCode(error.code);
    }

    // Check for category
    if (error.category) {
      return errorMapping.mapCategory(error.category);
    }

    // Check for response data
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Check for message
    if (error.message) {
      // Try to find a matching pattern
      const message = error.message.toLowerCase();
      
      if (message.includes('network')) {
        return ERROR_MESSAGES.network.offline;
      }
      if (message.includes('timeout')) {
        return ERROR_MESSAGES.network.timeout;
      }
      if (message.includes('auth') || message.includes('login')) {
        return ERROR_MESSAGES.authentication.loginFailed;
      }
      if (message.includes('permission') || message.includes('denied')) {
        return ERROR_MESSAGES.authentication.unauthorized;
      }
      if (message.includes('validation') || message.includes('invalid')) {
        return ERROR_MESSAGES.validation.invalidFormat;
      }
      if (message.includes('payment') || message.includes('card')) {
        return ERROR_MESSAGES.payment.failed;
      }
    }

    // Default message
    return ERROR_MESSAGES.general.somethingWrong;
  },

  /**
   * Get contextual error message based on action
   */
  getContextualMessage: (error: any, context: string): string => {
    const baseMessage = errorMapping.extractMessage(error);
    
    const contextMessages: Record<string, Record<string, string>> = {
      login: {
        [ERROR_MESSAGES.network.offline]: '無法登入，請檢查網路連線',
        [ERROR_MESSAGES.authentication.loginFailed]: '登入失敗，請檢查帳號密碼',
      },
      register: {
        [ERROR_MESSAGES.network.offline]: '無法註冊，請檢查網路連線',
        [ERROR_MESSAGES.validation.invalidFormat]: '註冊資料格式不正確',
      },
      payment: {
        [ERROR_MESSAGES.network.offline]: '無法處理付款，請檢查網路連線',
        [ERROR_MESSAGES.payment.failed]: '付款失敗，請重試或更換付款方式',
      },
      eventRegistration: {
        [ERROR_MESSAGES.network.offline]: '無法報名活動，請檢查網路連線',
        [ERROR_MESSAGES.event.full]: '活動已額滿，無法報名',
      },
    };

    if (contextMessages[context] && contextMessages[context][baseMessage]) {
      return contextMessages[context][baseMessage];
    }

    return baseMessage;
  },
};

export default errorMapping;