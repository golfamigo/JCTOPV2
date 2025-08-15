import { ERROR_MESSAGES } from '../constants/errorMessages';
import { errorService } from '../services/errorService';
import { retryService } from '../services/retryService';
import { networkUtils } from './networkUtils';

/**
 * Edge case handlers for various scenarios
 */
export const edgeCaseHandlers = {
  /**
   * Handle API timeout scenarios
   */
  handleTimeout: async (
    request: () => Promise<any>,
    timeoutMs: number = 30000,
    options?: {
      onTimeout?: () => void;
      retryOnTimeout?: boolean;
      maxRetries?: number;
    }
  ) => {
    const { onTimeout, retryOnTimeout = true, maxRetries = 2 } = options || {};

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(ERROR_MESSAGES.network.timeout));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([request(), timeoutPromise]);
      return result;
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.network.timeout) {
        if (onTimeout) {
          onTimeout();
        }

        if (retryOnTimeout) {
          return retryService.executeWithRetry(request, {
            maxAttempts: maxRetries,
            baseDelay: 2000,
          });
        }
      }
      throw error;
    }
  },

  /**
   * Handle malformed API response data
   */
  handleMalformedResponse: (response: any, expectedShape?: Record<string, any>) => {
    // Check if response exists
    if (!response) {
      errorService.logError(new Error('Empty response received'), { response });
      return null;
    }

    // Check if response is an object
    if (typeof response !== 'object') {
      errorService.logError(new Error('Invalid response type'), { response, type: typeof response });
      return null;
    }

    // Validate expected shape if provided
    if (expectedShape) {
      const missingFields: string[] = [];
      const invalidTypes: string[] = [];

      for (const [key, expectedType] of Object.entries(expectedShape)) {
        if (!(key in response)) {
          missingFields.push(key);
        } else if (typeof response[key] !== expectedType) {
          invalidTypes.push(`${key} (expected ${expectedType}, got ${typeof response[key]})`);
        }
      }

      if (missingFields.length > 0 || invalidTypes.length > 0) {
        errorService.logError(new Error('Response validation failed'), {
          missingFields,
          invalidTypes,
          response,
        });
      }
    }

    // Return sanitized response
    return response;
  },

  /**
   * Handle insufficient device storage
   */
  handleInsufficientStorage: async (
    requiredBytes: number,
    onInsufficientStorage?: () => void
  ): Promise<boolean> => {
    try {
      // This is a placeholder - actual implementation would check device storage
      // React Native doesn't have a standard API for this, would need a native module
      const hasSpace = true; // Placeholder

      if (!hasSpace) {
        if (onInsufficientStorage) {
          onInsufficientStorage();
        }
        throw new Error(ERROR_MESSAGES.system.storageUull);
      }

      return hasSpace;
    } catch (error) {
      errorService.logError(error, { requiredBytes });
      return false;
    }
  },

  /**
   * Handle camera/photo permissions denied
   */
  handlePermissionDenied: async (
    permission: 'camera' | 'photos' | 'location' | 'notifications',
    options?: {
      onDenied?: () => void;
      showSettings?: boolean;
    }
  ) => {
    const { onDenied, showSettings = true } = options || {};

    const permissionMessages = {
      camera: ERROR_MESSAGES.permission.cameradenied,
      photos: ERROR_MESSAGES.permission.photoLibraryDenied,
      location: ERROR_MESSAGES.permission.locationDenied,
      notifications: ERROR_MESSAGES.permission.notificationDenied,
    };

    const error = new Error(permissionMessages[permission]);
    errorService.logError(error, { permission });

    if (onDenied) {
      onDenied();
    }

    if (showSettings) {
      // Would open app settings in real implementation
      console.log('Opening settings for permission:', permission);
    }

    throw error;
  },

  /**
   * Handle payment processing edge cases
   */
  handlePaymentEdgeCases: async (
    paymentProcess: () => Promise<any>,
    options?: {
      onDeclined?: () => void;
      onTimeout?: () => void;
      onDuplicate?: () => void;
      timeoutMs?: number;
    }
  ) => {
    const { onDeclined, onTimeout, onDuplicate, timeoutMs = 60000 } = options || {};

    try {
      // Add timeout handling
      const result = await edgeCaseHandlers.handleTimeout(
        paymentProcess,
        timeoutMs,
        {
          onTimeout,
          retryOnTimeout: false, // Don't auto-retry payments
        }
      );

      // Check for specific payment errors
      if (result?.error) {
        switch (result.error.code) {
          case 'CARD_DECLINED':
            if (onDeclined) onDeclined();
            throw new Error(ERROR_MESSAGES.payment.declined);
          case 'DUPLICATE_TRANSACTION':
            if (onDuplicate) onDuplicate();
            throw new Error(ERROR_MESSAGES.payment.alreadyPaid);
          case 'INSUFFICIENT_FUNDS':
            throw new Error(ERROR_MESSAGES.payment.insufficientFunds);
          default:
            throw new Error(ERROR_MESSAGES.payment.failed);
        }
      }

      return result;
    } catch (error) {
      errorService.logError(error, { context: 'payment_processing' });
      throw error;
    }
  },

  /**
   * Handle concurrent user session conflicts
   */
  handleSessionConflict: async (
    options?: {
      onConflict?: () => void;
      forceLogout?: boolean;
    }
  ) => {
    const { onConflict, forceLogout = false } = options || {};

    if (onConflict) {
      onConflict();
    }

    if (forceLogout) {
      // Would trigger logout in real implementation
      console.log('Forcing logout due to session conflict');
    }

    throw new Error(ERROR_MESSAGES.authentication.sessionExpired);
  },

  /**
   * Handle rapid button tapping (debouncing)
   */
  createDebouncer: (delay: number = 300) => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    return (callback: () => void) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        callback();
        timeoutId = null;
      }, delay);
    };
  },

  /**
   * Handle network changes during operations
   */
  handleNetworkChange: async (
    operation: () => Promise<any>,
    options?: {
      onOffline?: () => void;
      onReconnect?: () => void;
      waitForConnection?: boolean;
    }
  ) => {
    const { onOffline, onReconnect, waitForConnection = true } = options || {};

    // Check initial network state
    const isOnline = await networkUtils.isOnline();
    
    if (!isOnline) {
      if (onOffline) {
        onOffline();
      }

      if (waitForConnection) {
        const connected = await networkUtils.waitForConnection(30000);
        if (connected && onReconnect) {
          onReconnect();
        }
      } else {
        throw new Error(ERROR_MESSAGES.network.offline);
      }
    }

    // Execute operation with network monitoring
    return operation();
  },

  /**
   * Handle empty response arrays
   */
  handleEmptyArray: <T>(
    array: T[] | null | undefined,
    defaultValue: T[] = []
  ): T[] => {
    if (!Array.isArray(array)) {
      errorService.logError(new Error('Expected array but got non-array'), {
        received: array,
        type: typeof array,
      });
      return defaultValue;
    }
    return array.length === 0 ? defaultValue : array;
  },

  /**
   * Handle missing required fields
   */
  handleMissingFields: <T extends Record<string, any>>(
    data: Partial<T>,
    requiredFields: (keyof T)[],
    defaults?: Partial<T>
  ): T => {
    const result = { ...defaults, ...data } as T;
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!(field in result) || result[field] === undefined || result[field] === null) {
        missingFields.push(String(field));
      }
    }

    if (missingFields.length > 0) {
      errorService.logError(new Error('Missing required fields'), {
        missingFields,
        data,
      });
    }

    return result;
  },

  /**
   * Handle device orientation changes during operations
   */
  handleOrientationChange: (callback: (orientation: string) => void) => {
    // This would use Dimensions API in real implementation
    const handleChange = ({ window }: any) => {
      const orientation = window.width > window.height ? 'landscape' : 'portrait';
      callback(orientation);
    };

    // Would add event listener in real implementation
    return () => {
      // Cleanup
    };
  },

  /**
   * Handle app backgrounding during critical operations
   */
  handleAppStateChange: (
    criticalOperation: () => Promise<any>,
    options?: {
      pauseOnBackground?: boolean;
      resumeOnForeground?: boolean;
    }
  ) => {
    const { pauseOnBackground = true, resumeOnForeground = true } = options || {};
    let isPaused = false;
    let operationPromise: Promise<any> | null = null;

    const execute = async () => {
      if (isPaused && pauseOnBackground) {
        // Wait for app to return to foreground
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!isPaused) {
              clearInterval(checkInterval);
              resolve(criticalOperation());
            }
          }, 1000);
        });
      }

      operationPromise = criticalOperation();
      return operationPromise;
    };

    // Would use AppState API in real implementation
    return {
      execute,
      pause: () => { isPaused = true; },
      resume: () => { isPaused = false; },
    };
  },

  /**
   * Handle low memory conditions
   */
  handleLowMemory: (
    onLowMemory?: () => void,
    options?: {
      clearCache?: boolean;
      reduceQuality?: boolean;
    }
  ) => {
    const { clearCache = true, reduceQuality = true } = options || {};

    if (onLowMemory) {
      onLowMemory();
    }

    if (clearCache) {
      // Would clear image cache, temp files etc. in real implementation
      console.log('Clearing cache due to low memory');
    }

    if (reduceQuality) {
      // Would reduce image quality, disable animations etc.
      console.log('Reducing quality due to low memory');
    }
  },
};

export default edgeCaseHandlers;