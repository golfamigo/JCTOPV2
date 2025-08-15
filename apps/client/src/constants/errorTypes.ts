/**
 * Error type definitions for the application
 */

// Base error interface
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  category?: ErrorCategory;
  details?: any;
  timestamp?: number;
  retry?: boolean;
  userMessage?: string;
}

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  PAYMENT = 'payment',
  EVENT = 'event',
  USER = 'user',
  FILE = 'file',
  PERMISSION = 'permission',
  SYSTEM = 'system',
  UNKNOWN = 'unknown',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Network error types
export interface NetworkError extends AppError {
  category: ErrorCategory.NETWORK;
  statusCode: number;
  url?: string;
  method?: string;
  responseTime?: number;
}

// Validation error types
export interface ValidationError extends AppError {
  category: ErrorCategory.VALIDATION;
  fields?: Record<string, string[]>;
  rules?: Record<string, any>;
}

// Authentication error types
export interface AuthenticationError extends AppError {
  category: ErrorCategory.AUTHENTICATION;
  authMethod?: 'email' | 'phone' | 'google' | 'facebook' | 'apple';
  userId?: string;
}

// Payment error types
export interface PaymentError extends AppError {
  category: ErrorCategory.PAYMENT;
  transactionId?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  failureReason?: string;
}

// Event error types
export interface EventError extends AppError {
  category: ErrorCategory.EVENT;
  eventId?: string;
  ticketType?: string;
  availableSeats?: number;
}

// Permission error types
export interface PermissionError extends AppError {
  category: ErrorCategory.PERMISSION;
  permission: string;
  platform: 'ios' | 'android';
  canRequestAgain: boolean;
}

// File error types
export interface FileError extends AppError {
  category: ErrorCategory.FILE;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  operation?: 'upload' | 'download' | 'delete' | 'read';
}

// Error handler configuration
export interface ErrorHandlerConfig {
  logErrors: boolean;
  showDebugInfo: boolean;
  reportToCrashlytics: boolean;
  retryConfig?: RetryConfig;
  fallbackBehavior?: FallbackBehavior;
}

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors?: string[];
}

// Fallback behavior
export interface FallbackBehavior {
  showToast?: boolean;
  showModal?: boolean;
  navigateToError?: boolean;
  customFallback?: () => void;
}

// Error context for tracking
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  screenName?: string;
  action?: string;
  metadata?: Record<string, any>;
  breadcrumbs?: ErrorBreadcrumb[];
}

// Error breadcrumb for debugging
export interface ErrorBreadcrumb {
  timestamp: number;
  type: 'navigation' | 'action' | 'error' | 'log';
  message: string;
  data?: any;
}

// Error report for analytics
export interface ErrorReport {
  error: AppError;
  context: ErrorContext;
  severity: ErrorSeverity;
  timestamp: number;
  deviceInfo?: DeviceInfo;
  appInfo?: AppInfo;
}

// Device information
export interface DeviceInfo {
  platform: string;
  version: string;
  model: string;
  manufacturer?: string;
  isTablet?: boolean;
  screenDimensions?: {
    width: number;
    height: number;
  };
}

// App information
export interface AppInfo {
  version: string;
  buildNumber: string;
  environment: 'development' | 'staging' | 'production';
}

// Error recovery options
export interface ErrorRecoveryOptions {
  retry?: () => Promise<void>;
  fallback?: () => void;
  ignore?: () => void;
  report?: () => void;
  navigate?: (screen: string) => void;
}

// Type guards
export const isNetworkError = (error: any): error is NetworkError => {
  return error?.category === ErrorCategory.NETWORK;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error?.category === ErrorCategory.VALIDATION;
};

export const isAuthenticationError = (error: any): error is AuthenticationError => {
  return error?.category === ErrorCategory.AUTHENTICATION;
};

export const isPaymentError = (error: any): error is PaymentError => {
  return error?.category === ErrorCategory.PAYMENT;
};

export const isEventError = (error: any): error is EventError => {
  return error?.category === ErrorCategory.EVENT;
};

export const isPermissionError = (error: any): error is PermissionError => {
  return error?.category === ErrorCategory.PERMISSION;
};

export const isFileError = (error: any): error is FileError => {
  return error?.category === ErrorCategory.FILE;
};

// Error factory functions
export const createNetworkError = (
  message: string,
  statusCode: number,
  details?: Partial<NetworkError>
): NetworkError => ({
  name: 'NetworkError',
  message,
  category: ErrorCategory.NETWORK,
  statusCode,
  timestamp: Date.now(),
  ...details,
});

export const createValidationError = (
  message: string,
  fields?: Record<string, string[]>,
  details?: Partial<ValidationError>
): ValidationError => ({
  name: 'ValidationError',
  message,
  category: ErrorCategory.VALIDATION,
  fields,
  timestamp: Date.now(),
  ...details,
});

export const createAuthenticationError = (
  message: string,
  details?: Partial<AuthenticationError>
): AuthenticationError => ({
  name: 'AuthenticationError',
  message,
  category: ErrorCategory.AUTHENTICATION,
  timestamp: Date.now(),
  ...details,
});

export const createPaymentError = (
  message: string,
  details?: Partial<PaymentError>
): PaymentError => ({
  name: 'PaymentError',
  message,
  category: ErrorCategory.PAYMENT,
  timestamp: Date.now(),
  ...details,
});

export const createEventError = (
  message: string,
  eventId?: string,
  details?: Partial<EventError>
): EventError => ({
  name: 'EventError',
  message,
  category: ErrorCategory.EVENT,
  eventId,
  timestamp: Date.now(),
  ...details,
});

export const createPermissionError = (
  message: string,
  permission: string,
  platform: 'ios' | 'android',
  canRequestAgain: boolean
): PermissionError => ({
  name: 'PermissionError',
  message,
  category: ErrorCategory.PERMISSION,
  permission,
  platform,
  canRequestAgain,
  timestamp: Date.now(),
});

export const createFileError = (
  message: string,
  operation: 'upload' | 'download' | 'delete' | 'read',
  details?: Partial<FileError>
): FileError => ({
  name: 'FileError',
  message,
  category: ErrorCategory.FILE,
  operation,
  timestamp: Date.now(),
  ...details,
});