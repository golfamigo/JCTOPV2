import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import ForgotPasswordForm from './ForgotPasswordForm';
import { theme } from '@/theme';

// Mock expo-router
const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

jest.mock('expo-router', () => ({
  router: mockRouter,
  Link: ({ children, ...props }: any) => children,
}));

// Mock react-i18next
const mockT = jest.fn((key: string, options?: any) => {
  const translations: Record<string, string> = {
    'auth.resetPassword': 'Reset Password',
    'auth.resetPasswordDescription': 'Enter your email address and we\'ll send you a link to reset your password.',
    'auth.email': 'Email',
    'auth.enterEmail': 'Enter your email address',
    'auth.sendResetLink': 'Send Reset Link',
    'auth.backToSignIn': 'Back to Sign In',
    'auth.emailSent': 'Email Sent!',
    'common.error': 'Error',
    'common.loading': 'Loading...',
    'validation.required': 'This field is required',
    'validation.invalidEmail': 'Please enter a valid email address',
    'auth.emailTooLong': 'Email must not exceed 100 characters',
    'auth.resetPasswordEmailSent': 'If an account with that email address exists, we have sent you a password reset link.',
    'messages.somethingWentWrong': 'Something went wrong, please try again',
  };
  
  return options?.defaultValue || translations[key] || key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock theme hook
jest.mock('@/theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      background: '#FFFFFF',
      text: '#212529',
      textSecondary: '#6C757D',
      danger: '#DC3545',
      success: '#28A745',
      border: '#E9ECEF',
      dark: '#212529',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
  }),
  theme,
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('ForgotPasswordForm', () => {
  const mockOnForgotPassword = jest.fn();

  beforeEach(() => {
    mockOnForgotPassword.mockClear();
    mockRouter.back.mockClear();
    mockT.mockClear();
  });

  const renderForgotPasswordForm = () => {
    return render(
      <TestWrapper>
        <ForgotPasswordForm onForgotPassword={mockOnForgotPassword} />
      </TestWrapper>
    );
  };

  it('renders form elements correctly', () => {
    renderForgotPasswordForm();

    expect(screen.getByText('Reset Password')).toBeTruthy();
    expect(screen.getByText('Enter your email address and we\'ll send you a link to reset your password.')).toBeTruthy();
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your email address')).toBeTruthy();
    expect(screen.getByText('Send Reset Link')).toBeTruthy();
    expect(screen.getByText('Back to Sign In')).toBeTruthy();
  });

  it('displays validation error for empty email', async () => {
    renderForgotPasswordForm();

    const submitButton = screen.getByText('Send Reset Link');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeTruthy();
    });

    expect(mockOnForgotPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for invalid email format', async () => {
    renderForgotPasswordForm();

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const submitButton = screen.getByText('Send Reset Link');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeTruthy();
    });

    expect(mockOnForgotPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for email too long', async () => {
    renderForgotPasswordForm();

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const submitButton = screen.getByText('Send Reset Link');

    const longEmail = 'a'.repeat(90) + '@example.com'; // > 100 characters
    fireEvent.changeText(emailInput, longEmail);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email must not exceed 100 characters')).toBeTruthy();
    });

    expect(mockOnForgotPassword).not.toHaveBeenCalled();
  });

  it('handles whitespace in email correctly', async () => {
    renderForgotPasswordForm();

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const submitButton = screen.getByText('Send Reset Link');

    // Test email with leading/trailing whitespace
    fireEvent.changeText(emailInput, '  test@example.com  ');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnForgotPassword).toHaveBeenCalledWith('test@example.com'); // Should be trimmed
    });
  });

  it('submits form with valid email', async () => {
    renderForgotPasswordForm();

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const submitButton = screen.getByText('Send Reset Link');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnForgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('displays success message after successful submission', async () => {
    mockOnForgotPassword.mockResolvedValueOnce(undefined);
    renderForgotPasswordForm();

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const submitButton = screen.getByText('Send Reset Link');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email Sent!')).toBeTruthy();
      expect(screen.getByText('If an account with that email address exists, we have sent you a password reset link.')).toBeTruthy();
    });
  });

  it('displays error message on submission failure', async () => {
    const errorMessage = 'Network error';
    mockOnForgotPassword.mockRejectedValueOnce(new Error(errorMessage));
    renderForgotPasswordForm();

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const submitButton = screen.getByText('Send Reset Link');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeTruthy();
      expect(screen.getByText(errorMessage)).toBeTruthy();
    });
  });

  it('clears form after successful submission', async () => {
    mockOnForgotPassword.mockResolvedValueOnce(undefined);
    renderForgotPasswordForm();

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const submitButton = screen.getByText('Send Reset Link');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email Sent!')).toBeTruthy();
    });

    // Check that email input is cleared
    expect(emailInput.props.value).toBe('');
  });

  it('handles back navigation correctly', () => {
    renderForgotPasswordForm();

    const backButton = screen.getByText('Back to Sign In');
    fireEvent.press(backButton);

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('calls submit on enter key press', async () => {
    renderForgotPasswordForm();

    const emailInput = screen.getByPlaceholderText('Enter your email address');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent(emailInput, 'submitEditing');

    await waitFor(() => {
      expect(mockOnForgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows loading state during submission', async () => {
    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockOnForgotPassword.mockReturnValueOnce(promise);

    renderForgotPasswordForm();

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const submitButton = screen.getByText('Send Reset Link');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);

    // Should show loading text
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeTruthy();
    });

    // Resolve the promise
    resolvePromise!();

    await waitFor(() => {
      expect(screen.getByText('Send Reset Link')).toBeTruthy();
    });
  });

  it('uses i18n translations correctly', () => {
    renderForgotPasswordForm();

    expect(mockT).toHaveBeenCalledWith('auth.resetPassword');
    expect(mockT).toHaveBeenCalledWith('auth.resetPasswordDescription', expect.any(Object));
    expect(mockT).toHaveBeenCalledWith('auth.email');
    expect(mockT).toHaveBeenCalledWith('auth.enterEmail');
    expect(mockT).toHaveBeenCalledWith('auth.sendResetLink');
    expect(mockT).toHaveBeenCalledWith('auth.backToSignIn', expect.any(Object));
  });

  it('applies proper accessibility attributes', () => {
    renderForgotPasswordForm();

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const submitButton = screen.getByText('Send Reset Link');

    // Check input properties
    expect(emailInput.props.autoComplete).toBe('email');
    expect(emailInput.props.keyboardType).toBe('email-address');
    expect(emailInput.props.autoCapitalize).toBe('none');
    expect(emailInput.props.autoCorrect).toBe(false);
    expect(emailInput.props.autoFocus).toBe(true);

    // Check button is touchable
    expect(submitButton).toBeTruthy();
  });
});