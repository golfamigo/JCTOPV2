import { useState, useCallback, useRef } from 'react';
import { retryService, RetryConfig } from '../services/retryService';

interface UseRetryOptions extends Partial<RetryConfig> {
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  onRetry?: (attempt: number) => void;
}

export const useRetry = <T = any>(
  operation: () => Promise<T>,
  options: UseRetryOptions = {}
) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lastError, setLastError] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { onSuccess, onError, onRetry, ...retryConfig } = options;

  const execute = useCallback(async () => {
    setIsRetrying(true);
    setLastError(null);
    setAttempts(0);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const result = await retryService.executeWithRetry(operation, {
        ...retryConfig,
        abortSignal: abortControllerRef.current.signal,
        onRetry: (attempt, error) => {
          setAttempts(attempt);
          setLastError(error);
          if (onRetry) {
            onRetry(attempt);
          }
        },
      });

      if (result.success) {
        setData(result.data || null);
        if (onSuccess) {
          onSuccess(result.data);
        }
        return result.data;
      } else {
        throw result.error;
      }
    } catch (error) {
      setLastError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      setIsRetrying(false);
      abortControllerRef.current = null;
    }
  }, [operation, retryConfig, onSuccess, onError, onRetry]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsRetrying(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setAttempts(0);
    setLastError(null);
    setData(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    execute,
    cancel,
    reset,
    isRetrying,
    attempts,
    lastError,
    data,
    hasError: !!lastError,
    isSuccess: !!data && !lastError,
  };
};

// Hook for manual retry with UI state
export const useManualRetry = <T = any>(
  operation: () => Promise<T>,
  options: UseRetryOptions = {}
) => {
  const [retryCount, setRetryCount] = useState(0);
  const { execute, ...retryState } = useRetry(operation, {
    ...options,
    maxAttempts: 1, // Manual retry, so only one attempt per trigger
  });

  const retry = useCallback(async () => {
    setRetryCount((prev) => prev + 1);
    return execute();
  }, [execute]);

  return {
    ...retryState,
    retry,
    retryCount,
  };
};

// Hook for auto-retry on mount
export const useAutoRetry = <T = any>(
  operation: () => Promise<T>,
  dependencies: any[] = [],
  options: UseRetryOptions = {}
) => {
  const { execute, ...retryState } = useRetry(operation, options);

  // Auto-execute on mount and when dependencies change
  useState(() => {
    execute().catch(() => {
      // Error is handled in the hook
    });
  });

  return {
    ...retryState,
    retry: execute,
  };
};

export default useRetry;