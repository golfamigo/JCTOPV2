import { useState, useCallback } from 'react';
import { errorService } from '../services/errorService';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import { AppError, ErrorCategory } from '../constants/errorTypes';

interface UseErrorHandlerOptions {
  onError?: (error: AppError) => void;
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    onError,
    showToast = true,
    logError = true,
    fallbackMessage = ERROR_MESSAGES.general.somethingWrong,
  } = options;

  const [error, setError] = useState<AppError | null>(null);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleError = useCallback((error: any) => {
    // Map error to user-friendly message
    const userMessage = errorService.mapErrorToUserMessage(error);
    
    // Create app error
    const appError: AppError = {
      name: error.name || 'UnknownError',
      message: error.message || fallbackMessage,
      userMessage,
      category: error.category || ErrorCategory.UNKNOWN,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      timestamp: Date.now(),
    };

    // Update state
    setError(appError);
    setIsError(true);
    setErrorMessage(userMessage);

    // Log error if enabled
    if (logError) {
      errorService.logError(appError);
    }

    // Show toast if enabled
    if (showToast) {
      // TODO: Implement toast notification
      console.log('Toast:', userMessage);
    }

    // Call custom error handler
    if (onError) {
      onError(appError);
    }

    return appError;
  }, [onError, showToast, logError, fallbackMessage]);

  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
    setErrorMessage('');
  }, []);

  const throwError = useCallback((message: string, category?: ErrorCategory, details?: any) => {
    const error: AppError = {
      name: 'ApplicationError',
      message,
      category: category || ErrorCategory.UNKNOWN,
      details,
      timestamp: Date.now(),
    };
    
    handleError(error);
    throw error;
  }, [handleError]);

  return {
    error,
    isError,
    errorMessage,
    handleError,
    clearError,
    throwError,
  };
};

// Hook for async operations with error handling
export const useAsyncError = () => {
  const { handleError } = useErrorHandler();

  const throwAsyncError = useCallback((error: any) => {
    // Handle async errors
    setTimeout(() => {
      handleError(error);
    }, 0);
  }, [handleError]);

  return throwAsyncError;
};

// Hook for form validation errors
export const useValidationError = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  const setFieldError = useCallback((field: string, errors: string[]) => {
    setValidationErrors((prev) => ({
      ...prev,
      [field]: errors,
    }));
    setHasValidationErrors(true);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    setHasValidationErrors(Object.keys(validationErrors).length > 1);
  }, [validationErrors]);

  const clearAllErrors = useCallback(() => {
    setValidationErrors({});
    setHasValidationErrors(false);
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    const errors = validationErrors[field];
    return errors && errors.length > 0 ? errors[0] : undefined;
  }, [validationErrors]);

  return {
    validationErrors,
    hasValidationErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    getFieldError,
  };
};

export default useErrorHandler;