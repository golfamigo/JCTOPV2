import { errorService } from './errorService';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import { AppError, ErrorCategory } from '../constants/errorTypes';

/**
 * Retry configuration interface
 */
export interface RetryConfig {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
  abortSignal?: AbortSignal;
}

/**
 * Retry result interface
 */
export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
  totalDelay: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_CONFIG: Required<Omit<RetryConfig, 'retryCondition' | 'onRetry' | 'abortSignal'>> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
  retryableErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ECONNRESET',
    'ENOTFOUND',
    'NetworkError',
    'TimeoutError',
  ],
};

/**
 * Retry service for handling failed operations with exponential backoff
 */
class RetryService {
  private static instance: RetryService;
  private activeRetries: Map<string, AbortController> = new Map();

  private constructor() {}

  public static getInstance(): RetryService {
    if (!RetryService.instance) {
      RetryService.instance = new RetryService();
    }
    return RetryService.instance;
  }

  /**
   * Execute an operation with retry logic
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = {}
  ): Promise<RetryResult<T>> {
    const finalConfig = this.mergeConfig(config);
    const retryId = this.generateRetryId();
    const abortController = new AbortController();
    
    // Store abort controller for cancellation
    this.activeRetries.set(retryId, abortController);
    
    let lastError: any;
    let totalDelay = 0;
    
    try {
      for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
        // Check if retry was aborted
        if (abortController.signal.aborted || config.abortSignal?.aborted) {
          throw new Error('Retry aborted');
        }
        
        try {
          const result = await operation();
          
          // Success - clean up and return
          this.activeRetries.delete(retryId);
          return {
            success: true,
            data: result,
            attempts: attempt,
            totalDelay,
          };
        } catch (error) {
          lastError = error;
          
          // Log the error
          errorService.addBreadcrumb('error', `Retry attempt ${attempt} failed`, {
            error: error,
            retryId,
          });
          
          // Check if we should retry
          if (!this.shouldRetry(error, attempt, finalConfig)) {
            break;
          }
          
          // Call onRetry callback if provided
          if (config.onRetry) {
            config.onRetry(attempt, error);
          }
          
          // Don't delay after the last attempt
          if (attempt < finalConfig.maxAttempts) {
            const delay = this.calculateDelay(attempt, finalConfig);
            totalDelay += delay;
            
            // Wait with cancellation support
            await this.delayWithAbort(delay, abortController.signal);
          }
        }
      }
      
      // All attempts failed
      this.activeRetries.delete(retryId);
      return {
        success: false,
        error: lastError,
        attempts: finalConfig.maxAttempts,
        totalDelay,
      };
    } catch (abortError) {
      // Handle abort
      this.activeRetries.delete(retryId);
      return {
        success: false,
        error: abortError,
        attempts: 0,
        totalDelay,
      };
    }
  }

  /**
   * Execute multiple operations with retry logic
   */
  public async executeMultipleWithRetry<T>(
    operations: Array<() => Promise<T>>,
    config: RetryConfig = {}
  ): Promise<RetryResult<T>[]> {
    const results = await Promise.all(
      operations.map(operation => this.executeWithRetry(operation, config))
    );
    return results;
  }

  /**
   * Retry a failed network request
   */
  public async retryNetworkRequest<T>(
    request: () => Promise<T>,
    config?: RetryConfig
  ): Promise<T> {
    const networkConfig: RetryConfig = {
      ...config,
      retryCondition: (error) => {
        // Retry on network errors
        if (this.isNetworkError(error)) {
          return true;
        }
        
        // Retry on specific status codes
        const statusCode = error.statusCode || error.status;
        return statusCode >= 500 || statusCode === 429 || statusCode === 408;
      },
      onRetry: (attempt, error) => {
        console.log(`Network retry attempt ${attempt}:`, error.message);
      },
    };
    
    const result = await this.executeWithRetry(request, networkConfig);
    
    if (!result.success) {
      throw result.error;
    }
    
    return result.data!;
  }

  /**
   * Retry a failed payment operation
   */
  public async retryPaymentOperation<T>(
    operation: () => Promise<T>,
    config?: RetryConfig
  ): Promise<T> {
    const paymentConfig: RetryConfig = {
      maxAttempts: 2, // Limit payment retries
      baseDelay: 2000,
      ...config,
      retryCondition: (error) => {
        // Don't retry on declined cards or insufficient funds
        const nonRetryableCodes = ['CARD_DECLINED', 'INSUFFICIENT_FUNDS', 'INVALID_CARD'];
        if (error.code && nonRetryableCodes.includes(error.code)) {
          return false;
        }
        
        // Retry on timeout or server errors
        const statusCode = error.statusCode || error.status;
        return statusCode >= 500 || statusCode === 408;
      },
      onRetry: (attempt) => {
        console.log(`Payment retry attempt ${attempt}`);
      },
    };
    
    const result = await this.executeWithRetry(operation, paymentConfig);
    
    if (!result.success) {
      throw result.error;
    }
    
    return result.data!;
  }

  /**
   * Retry with custom strategy
   */
  public createCustomRetry(defaultConfig: RetryConfig) {
    return async <T>(
      operation: () => Promise<T>,
      overrideConfig?: Partial<RetryConfig>
    ): Promise<T> => {
      const config = { ...defaultConfig, ...overrideConfig };
      const result = await this.executeWithRetry(operation, config);
      
      if (!result.success) {
        throw result.error;
      }
      
      return result.data!;
    };
  }

  /**
   * Cancel an active retry operation
   */
  public cancelRetry(retryId: string): boolean {
    const controller = this.activeRetries.get(retryId);
    if (controller) {
      controller.abort();
      this.activeRetries.delete(retryId);
      return true;
    }
    return false;
  }

  /**
   * Cancel all active retries
   */
  public cancelAllRetries(): number {
    const count = this.activeRetries.size;
    this.activeRetries.forEach(controller => controller.abort());
    this.activeRetries.clear();
    return count;
  }

  /**
   * Check if error should trigger retry
   */
  private shouldRetry(
    error: any,
    attempt: number,
    config: Required<Omit<RetryConfig, 'retryCondition' | 'onRetry' | 'abortSignal'>> & RetryConfig
  ): boolean {
    // Check if we've exceeded max attempts
    if (attempt >= config.maxAttempts) {
      return false;
    }
    
    // Use custom retry condition if provided
    if (config.retryCondition) {
      return config.retryCondition(error);
    }
    
    // Check retryable error codes
    if (error.code && config.retryableErrors.includes(error.code)) {
      return true;
    }
    
    // Check retryable error names
    if (error.name && config.retryableErrors.includes(error.name)) {
      return true;
    }
    
    // Check for network errors
    if (this.isNetworkError(error)) {
      return true;
    }
    
    // Check for retryable HTTP status codes
    const statusCode = error.statusCode || error.status;
    if (statusCode) {
      // Retry on server errors and rate limiting
      return statusCode >= 500 || statusCode === 429 || statusCode === 408;
    }
    
    return false;
  }

  /**
   * Check if error is a network error
   */
  private isNetworkError(error: any): boolean {
    if (error.category === ErrorCategory.NETWORK) {
      return true;
    }
    
    const networkIndicators = [
      'network',
      'fetch',
      'timeout',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ECONNRESET',
      'ENOTFOUND',
    ];
    
    const errorString = (error.message || error.code || error.name || '').toLowerCase();
    return networkIndicators.some(indicator => errorString.includes(indicator.toLowerCase()));
  }

  /**
   * Calculate delay for exponential backoff
   */
  private calculateDelay(
    attempt: number,
    config: Required<Omit<RetryConfig, 'retryCondition' | 'onRetry' | 'abortSignal'>>
  ): number {
    // Exponential backoff with jitter
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay; // Add 10% jitter
    const delay = Math.min(exponentialDelay + jitter, config.maxDelay);
    
    return Math.floor(delay);
  }

  /**
   * Delay with abort support
   */
  private delayWithAbort(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      
      const abortHandler = () => {
        clearTimeout(timeout);
        reject(new Error('Delay aborted'));
      };
      
      signal.addEventListener('abort', abortHandler, { once: true });
      
      // Clean up listener when delay completes
      setTimeout(() => {
        signal.removeEventListener('abort', abortHandler);
      }, ms);
    });
  }

  /**
   * Merge configuration with defaults
   */
  private mergeConfig(
    config: RetryConfig
  ): Required<Omit<RetryConfig, 'retryCondition' | 'onRetry' | 'abortSignal'>> & RetryConfig {
    return {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Generate unique retry ID
   */
  private generateRetryId(): string {
    return `retry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get retry statistics
   */
  public getRetryStats(): {
    activeRetries: number;
    retryIds: string[];
  } {
    return {
      activeRetries: this.activeRetries.size,
      retryIds: Array.from(this.activeRetries.keys()),
    };
  }
}

// Export singleton instance
export const retryService = RetryService.getInstance();

// Export helper functions
export const withRetry = async <T>(
  operation: () => Promise<T>,
  config?: RetryConfig
): Promise<T> => {
  const result = await retryService.executeWithRetry(operation, config);
  if (!result.success) {
    throw result.error;
  }
  return result.data!;
};

export const withNetworkRetry = <T>(
  request: () => Promise<T>,
  config?: RetryConfig
): Promise<T> => {
  return retryService.retryNetworkRequest(request, config);
};

export const withPaymentRetry = <T>(
  operation: () => Promise<T>,
  config?: RetryConfig
): Promise<T> => {
  return retryService.retryPaymentOperation(operation, config);
};

export default retryService;