import React from 'react';
import { render } from '@testing-library/react-native';

/**
 * Error handling test utilities
 */
export const errorTestUtils = {
  /**
   * Simulate network error
   */
  simulateNetworkError: () => {
    const error = new Error('Network request failed');
    (error as any).code = 'NETWORK_ERROR';
    throw error;
  },

  /**
   * Simulate offline state
   */
  simulateOfflineState: () => {
    // Mock NetInfo to return offline state
    jest.mock('@react-native-community/netinfo', () => ({
      addEventListener: jest.fn(() => ({
        isConnected: false,
        type: 'none',
      })),
      fetch: jest.fn(() => Promise.resolve({
        isConnected: false,
        type: 'none',
      })),
    }));
  },

  /**
   * Simulate API error with status code
   */
  simulateAPIError: (statusCode: number, message?: string) => {
    const error = new Error(message || `Request failed with status ${statusCode}`);
    (error as any).statusCode = statusCode;
    (error as any).response = {
      status: statusCode,
      data: {
        error: message || 'API Error',
      },
    };
    throw error;
  },

  /**
   * Test error boundary behavior
   */
  testErrorBoundary: (Component: React.ComponentType, ErrorBoundary: React.ComponentType<any>) => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { queryByText } = render(
      React.createElement(ErrorBoundary, {}, React.createElement(ThrowError))
    );

    // Check if error boundary caught the error
    return {
      hasError: !!queryByText(/error/i),
    };
  },

  /**
   * Create a component that throws an error
   */
  createErrorComponent: (errorMessage: string = 'Test error') => {
    return () => {
      throw new Error(errorMessage);
    };
  },

  /**
   * Mock console.error for testing
   */
  mockConsoleError: () => {
    const originalError = console.error;
    console.error = jest.fn();
    return () => {
      console.error = originalError;
    };
  },

  /**
   * Test async error handling
   */
  testAsyncError: async (asyncFn: () => Promise<any>, expectedError?: string) => {
    try {
      await asyncFn();
      return { success: true };
    } catch (error: any) {
      if (expectedError && error.message !== expectedError) {
        throw new Error(`Expected error "${expectedError}" but got "${error.message}"`);
      }
      return { success: false, error };
    }
  },
};

export default errorTestUtils;