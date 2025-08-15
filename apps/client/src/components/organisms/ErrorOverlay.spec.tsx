import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@/theme';
import { ErrorOverlay } from './ErrorOverlay';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'errors.networkError': 'Network Connection Error',
        'errors.serverError': 'Server Error',
        'errors.somethingWentWrong': 'Something Went Wrong',
        'errors.retry': 'Retry',
        'errors.goBack': 'Go Back',
        'errors.dismiss': 'Dismiss',
        'errors.showDetails': 'Show Details',
        'errors.hideDetails': 'Hide Details',
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

describe('ErrorOverlay', () => {
  it('renders when visible is true', () => {
    const { getByText } = renderWithTheme(
      <ErrorOverlay 
        visible={true} 
        message="Test error message"
      />
    );
    
    expect(getByText('Test error message')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = renderWithTheme(
      <ErrorOverlay 
        visible={false} 
        message="Should not be visible"
      />
    );
    
    expect(queryByText('Should not be visible')).toBeNull();
  });

  it('displays custom title when provided', () => {
    const { getByText } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        title="Custom Error"
        message="Error details"
      />
    );
    
    expect(getByText('Custom Error')).toBeTruthy();
    expect(getByText('Error details')).toBeTruthy();
  });

  it('displays retry button when onRetry is provided', () => {
    const onRetryMock = jest.fn();
    const { getByTestId } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        message="Error message"
        onRetry={onRetryMock}
        testID="error-overlay"
      />
    );
    
    const retryButton = getByTestId('error-overlay-retry-button');
    expect(retryButton).toBeTruthy();
  });

  it('calls onRetry when retry button is pressed', () => {
    const onRetryMock = jest.fn();
    const { getByTestId } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        message="Error message"
        onRetry={onRetryMock}
        testID="error-overlay"
      />
    );
    
    const retryButton = getByTestId('error-overlay-retry-button');
    fireEvent.press(retryButton);
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('displays go back button when onGoBack is provided', () => {
    const onGoBackMock = jest.fn();
    const { getByTestId } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        message="Error message"
        onGoBack={onGoBackMock}
        testID="error-overlay"
      />
    );
    
    const backButton = getByTestId('error-overlay-back-button');
    expect(backButton).toBeTruthy();
  });

  it('calls onGoBack when back button is pressed', () => {
    const onGoBackMock = jest.fn();
    const { getByTestId } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        message="Error message"
        onGoBack={onGoBackMock}
        testID="error-overlay"
      />
    );
    
    const backButton = getByTestId('error-overlay-back-button');
    fireEvent.press(backButton);
    expect(onGoBackMock).toHaveBeenCalledTimes(1);
  });

  it('displays dismiss button when onDismiss is provided', () => {
    const onDismissMock = jest.fn();
    const { getByTestId } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        message="Error message"
        onDismiss={onDismissMock}
        testID="error-overlay"
      />
    );
    
    const dismissButton = getByTestId('error-overlay-dismiss-button');
    expect(dismissButton).toBeTruthy();
  });

  it('calls onDismiss when dismiss button is pressed', () => {
    const onDismissMock = jest.fn();
    const { getByTestId } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        message="Error message"
        onDismiss={onDismissMock}
        testID="error-overlay"
      />
    );
    
    const dismissButton = getByTestId('error-overlay-dismiss-button');
    fireEvent.press(dismissButton);
    expect(onDismissMock).toHaveBeenCalledTimes(1);
  });

  it('shows details toggle when showDetails is true and details are provided', () => {
    const { getByTestId } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        message="Error message"
        details="Detailed error information"
        showDetails={true}
        testID="error-overlay"
      />
    );
    
    const detailsToggle = getByTestId('error-overlay-details-toggle');
    expect(detailsToggle).toBeTruthy();
  });

  it('toggles details visibility when toggle button is pressed', () => {
    const { getByTestId, getByText, queryByTestId } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        message="Error message"
        details="Detailed error information"
        showDetails={true}
        testID="error-overlay"
      />
    );
    
    const detailsToggle = getByTestId('error-overlay-details-toggle');
    
    // Initially details should be hidden
    expect(queryByTestId('error-overlay-details-content')).toBeNull();
    
    // Click to show details
    fireEvent.press(detailsToggle);
    expect(getByTestId('error-overlay-details-content')).toBeTruthy();
    expect(getByText('Detailed error information')).toBeTruthy();
    
    // Click to hide details
    fireEvent.press(detailsToggle);
    expect(queryByTestId('error-overlay-details-content')).toBeNull();
  });

  it('renders in full screen mode when fullScreen is true', () => {
    const { getByTestId } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        message="Error message"
        fullScreen={true}
        testID="error-overlay"
      />
    );
    
    const fullScreenContainer = getByTestId('error-overlay-fullscreen');
    expect(fullScreenContainer).toBeTruthy();
  });

  it('renders as overlay when fullScreen is false', () => {
    const { getByTestId, queryByTestId } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        message="Error message"
        fullScreen={false}
        testID="error-overlay"
      />
    );
    
    expect(getByTestId('error-overlay')).toBeTruthy();
    expect(queryByTestId('error-overlay-fullscreen')).toBeNull();
  });

  it('displays correct error type styling for network errors', () => {
    const { getByTestId } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        message="Network error"
        errorType="network"
        testID="error-overlay"
      />
    );
    
    const errorCard = getByTestId('error-overlay-card');
    expect(errorCard).toBeTruthy();
  });

  it('displays correct error type styling for server errors', () => {
    const { getByTestId } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        message="Server error"
        errorType="server"
        testID="error-overlay"
      />
    );
    
    const errorCard = getByTestId('error-overlay-card');
    expect(errorCard).toBeTruthy();
  });

  it('displays all action buttons when all callbacks are provided', () => {
    const onRetryMock = jest.fn();
    const onGoBackMock = jest.fn();
    const onDismissMock = jest.fn();
    
    const { getByTestId } = renderWithTheme(
      <ErrorOverlay 
        visible={true}
        message="Error message"
        onRetry={onRetryMock}
        onGoBack={onGoBackMock}
        onDismiss={onDismissMock}
        testID="error-overlay"
      />
    );
    
    expect(getByTestId('error-overlay-retry-button')).toBeTruthy();
    expect(getByTestId('error-overlay-back-button')).toBeTruthy();
    expect(getByTestId('error-overlay-dismiss-button')).toBeTruthy();
  });
});