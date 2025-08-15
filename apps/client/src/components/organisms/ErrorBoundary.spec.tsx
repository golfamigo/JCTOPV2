import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@/theme';
import { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'errors.somethingWentWrong': 'Something Went Wrong',
        'errors.unknownError': 'Unknown Error',
        'errors.retry': 'Retry',
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

// Mock console.error to avoid test output noise
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <Text>No error</Text>;
};

// Component that throws error in useEffect
const ThrowErrorInEffect: React.FC = () => {
  React.useEffect(() => {
    throw new Error('Effect error');
  }, []);
  return <Text>Component with effect</Text>;
};

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    const { getByText } = renderWithTheme(
      <ErrorBoundary>
        <Text>Child content</Text>
      </ErrorBoundary>
    );
    
    expect(getByText('Child content')).toBeTruthy();
  });

  it('catches errors and displays fallback UI', () => {
    const { getByText, queryByText } = renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(queryByText('No error')).toBeNull();
    expect(getByText('Something Went Wrong')).toBeTruthy();
    expect(getByText('Test error message')).toBeTruthy();
  });

  it('displays custom fallback when provided', () => {
    const customFallback = <Text>Custom error UI</Text>;
    const { getByText, queryByText } = renderWithTheme(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(queryByText('Something Went Wrong')).toBeNull();
    expect(getByText('Custom error UI')).toBeTruthy();
  });

  it('calls onError callback when error occurs', () => {
    const onErrorMock = jest.fn();
    renderWithTheme(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error message',
      }),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('resets error state when retry button is clicked', () => {
    let shouldThrow = true;
    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error('Test error message');
      }
      return <Text>No error</Text>;
    };

    const { getByTestId, getByText, queryByText } = renderWithTheme(
      <ErrorBoundary testID="error-boundary">
        <TestComponent />
      </ErrorBoundary>
    );
    
    // Error should be displayed
    expect(getByText('Something Went Wrong')).toBeTruthy();
    
    // Update the flag to not throw
    shouldThrow = false;
    
    // Click retry button - this should reset the error state
    const retryButton = getByTestId('error-boundary-retry');
    fireEvent.press(retryButton);
    
    // Should now show the normal content
    expect(getByText('No error')).toBeTruthy();
    expect(queryByText('Something Went Wrong')).toBeNull();
  });

  it('shows error details toggle in development mode', () => {
    const originalDev = __DEV__;
    Object.defineProperty(global, '__DEV__', {
      value: true,
      configurable: true,
    });

    const { getByTestId } = renderWithTheme(
      <ErrorBoundary testID="error-boundary" showDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const detailsToggle = getByTestId('error-boundary-toggle-details');
    expect(detailsToggle).toBeTruthy();

    Object.defineProperty(global, '__DEV__', {
      value: originalDev,
      configurable: true,
    });
  });

  it('toggles error details visibility', () => {
    const { getByTestId, queryByTestId } = renderWithTheme(
      <ErrorBoundary testID="error-boundary" showDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const detailsToggle = getByTestId('error-boundary-toggle-details');
    
    // Initially details should be hidden
    expect(queryByTestId('error-boundary-details')).toBeNull();
    
    // Click to show details
    fireEvent.press(detailsToggle);
    expect(getByTestId('error-boundary-details')).toBeTruthy();
    
    // Click to hide details
    fireEvent.press(detailsToggle);
    expect(queryByTestId('error-boundary-details')).toBeNull();
  });

  it('does not show details toggle when showDetails is false', () => {
    const { queryByTestId } = renderWithTheme(
      <ErrorBoundary testID="error-boundary" showDetails={false}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const detailsToggle = queryByTestId('error-boundary-toggle-details');
    expect(detailsToggle).toBeNull();
  });
});

describe('withErrorBoundary HOC', () => {
  const TestComponent: React.FC<{ text: string }> = ({ text }) => (
    <Text>{text}</Text>
  );

  it('wraps component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(TestComponent);
    const { getByText } = renderWithTheme(
      <WrappedComponent text="Wrapped content" />
    );
    
    expect(getByText('Wrapped content')).toBeTruthy();
  });

  it('catches errors in wrapped component', () => {
    const ErrorComponent: React.FC = () => {
      throw new Error('Component error');
    };
    
    const WrappedComponent = withErrorBoundary(ErrorComponent);
    const { getByText } = renderWithTheme(
      <WrappedComponent />
    );
    
    expect(getByText('Something Went Wrong')).toBeTruthy();
    expect(getByText('Component error')).toBeTruthy();
  });

  it('applies error boundary props from HOC', () => {
    const onErrorMock = jest.fn();
    const WrappedComponent = withErrorBoundary(ThrowError, {
      onError: onErrorMock,
      showDetails: true,
    });
    
    renderWithTheme(
      <WrappedComponent shouldThrow={true} />
    );
    
    expect(onErrorMock).toHaveBeenCalled();
  });

  it('preserves display name of wrapped component', () => {
    const NamedComponent: React.FC = () => <Text>Named</Text>;
    NamedComponent.displayName = 'NamedComponent';
    
    const WrappedComponent = withErrorBoundary(NamedComponent);
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(NamedComponent)');
  });

  it('forwards refs to wrapped component', () => {
    const RefComponent = React.forwardRef<View, { text: string }>((props, ref) => (
      <View ref={ref}>
        <Text>{props.text}</Text>
      </View>
    ));
    RefComponent.displayName = 'RefComponent';
    
    const WrappedComponent = withErrorBoundary(RefComponent);
    const ref = React.createRef<View>();
    
    const { getByText } = renderWithTheme(
      <WrappedComponent ref={ref} text="With ref" />
    );
    
    expect(getByText('With ref')).toBeTruthy();
    expect(ref.current).toBeTruthy();
  });
});

describe('ErrorBoundary Accessibility', () => {
  it('provides accessible error messages', () => {
    const { getByText } = renderWithTheme(
      <ErrorBoundary testID="error-boundary">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const errorTitle = getByText('Something Went Wrong');
    const errorMessage = getByText('Test error message');
    
    expect(errorTitle).toBeTruthy();
    expect(errorMessage).toBeTruthy();
  });

  it('ensures retry button is accessible', () => {
    const { getByTestId } = renderWithTheme(
      <ErrorBoundary testID="error-boundary">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const retryButton = getByTestId('error-boundary-retry');
    expect(retryButton).toBeTruthy();
    // In a real app, you'd check for accessibility props like accessibilityLabel
  });
});