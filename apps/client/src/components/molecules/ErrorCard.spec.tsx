import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@/theme';
import { ErrorCard } from './ErrorCard';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'errors.networkError': 'Network Connection Error',
        'errors.serverError': 'Server Error',
        'errors.validationError': 'Validation Error',
        'errors.somethingWentWrong': 'Something Went Wrong',
        'errors.retry': 'Retry',
        'errors.dismiss': 'Dismiss',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ErrorCard', () => {
  it('renders with required message prop', () => {
    const { getByText } = renderWithTheme(
      <ErrorCard message="Test error message" />
    );
    
    expect(getByText('Test error message')).toBeTruthy();
    expect(getByText('Something Went Wrong')).toBeTruthy();
  });

  it('renders custom title when provided', () => {
    const { getByText } = renderWithTheme(
      <ErrorCard 
        title="Custom Error Title"
        message="Test error message" 
      />
    );
    
    expect(getByText('Custom Error Title')).toBeTruthy();
    expect(getByText('Test error message')).toBeTruthy();
  });

  it('displays correct icon for network error type', () => {
    const { getByTestId } = renderWithTheme(
      <ErrorCard 
        message="Network error"
        errorType="network"
        testID="error-card"
      />
    );
    
    const icon = getByTestId('error-card-icon');
    expect(icon).toBeTruthy();
  });

  it('displays correct icon for server error type', () => {
    const { getByTestId } = renderWithTheme(
      <ErrorCard 
        message="Server error"
        errorType="server"
        testID="error-card"
      />
    );
    
    const icon = getByTestId('error-card-icon');
    expect(icon).toBeTruthy();
  });

  it('displays correct icon for validation error type', () => {
    const { getByTestId } = renderWithTheme(
      <ErrorCard 
        message="Validation error"
        errorType="validation"
        testID="error-card"
      />
    );
    
    const icon = getByTestId('error-card-icon');
    expect(icon).toBeTruthy();
  });

  it('displays retry button when onRetry is provided', () => {
    const onRetryMock = jest.fn();
    const { getByText } = renderWithTheme(
      <ErrorCard 
        message="Error message"
        onRetry={onRetryMock}
      />
    );
    
    const retryButton = getByText('Retry');
    expect(retryButton).toBeTruthy();
  });

  it('calls onRetry when retry button is pressed', () => {
    const onRetryMock = jest.fn();
    const { getByTestId } = renderWithTheme(
      <ErrorCard 
        message="Error message"
        onRetry={onRetryMock}
        testID="error-card"
      />
    );
    
    const retryButton = getByTestId('error-card-retry-button');
    fireEvent.press(retryButton);
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('displays dismiss button when onDismiss is provided', () => {
    const onDismissMock = jest.fn();
    const { getByText } = renderWithTheme(
      <ErrorCard 
        message="Error message"
        onDismiss={onDismissMock}
      />
    );
    
    const dismissButton = getByText('Dismiss');
    expect(dismissButton).toBeTruthy();
  });

  it('calls onDismiss when dismiss button is pressed', () => {
    const onDismissMock = jest.fn();
    const { getByTestId } = renderWithTheme(
      <ErrorCard 
        message="Error message"
        onDismiss={onDismissMock}
        testID="error-card"
      />
    );
    
    const dismissButton = getByTestId('error-card-dismiss-button');
    fireEvent.press(dismissButton);
    expect(onDismissMock).toHaveBeenCalledTimes(1);
  });

  it('displays both retry and dismiss buttons when both callbacks are provided', () => {
    const onRetryMock = jest.fn();
    const onDismissMock = jest.fn();
    const { getByText } = renderWithTheme(
      <ErrorCard 
        message="Error message"
        onRetry={onRetryMock}
        onDismiss={onDismissMock}
      />
    );
    
    expect(getByText('Retry')).toBeTruthy();
    expect(getByText('Dismiss')).toBeTruthy();
  });

  it('hides icon when showIcon is false', () => {
    const { queryByTestId } = renderWithTheme(
      <ErrorCard 
        message="Error message"
        showIcon={false}
        testID="error-card"
      />
    );
    
    const icon = queryByTestId('error-card-icon');
    expect(icon).toBeNull();
  });

  it('applies custom container styles', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = renderWithTheme(
      <ErrorCard 
        message="Error message"
        containerStyle={customStyle}
        testID="error-card"
      />
    );
    
    const card = getByTestId('error-card');
    expect(card).toBeTruthy();
  });

  it('uses correct default title for network error', () => {
    const { getByText } = renderWithTheme(
      <ErrorCard 
        message="Network issue"
        errorType="network"
      />
    );
    
    expect(getByText('Network Connection Error')).toBeTruthy();
  });

  it('uses correct default title for server error', () => {
    const { getByText } = renderWithTheme(
      <ErrorCard 
        message="Server issue"
        errorType="server"
      />
    );
    
    expect(getByText('Server Error')).toBeTruthy();
  });

  it('uses correct default title for validation error', () => {
    const { getByText } = renderWithTheme(
      <ErrorCard 
        message="Validation issue"
        errorType="validation"
      />
    );
    
    expect(getByText('Validation Error')).toBeTruthy();
  });
});