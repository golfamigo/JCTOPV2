import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import ResetPasswordForm from './ResetPasswordForm';
import { theme } from '@/theme';

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};

const mockUseLocalSearchParams = jest.fn();

jest.mock('expo-router', () => ({
  router: mockRouter,
  useLocalSearchParams: mockUseLocalSearchParams,
  Link: ({ children, ...props }: any) => children,
}));

// Mock react-i18next
const mockT = jest.fn((key: string, options?: any) => {
  const translations: Record<string, string> = {
    'auth.setNewPassword': 'Set New Password',
    'auth.setNewPasswordDescription': 'Enter your new password below. Make sure it\'s strong and secure.',
    'auth.newPassword': 'New Password',
    'auth.confirmNewPassword': 'Confirm New Password',
    'auth.enterNewPassword': 'Enter your new password',
    'auth.confirmNewPasswordPlaceholder': 'Confirm your new password',
    'auth.resetPassword': 'Reset Password',
    'auth.backToSignIn': 'Back to Sign In',
    'auth.passwordStrengthLabel': 'Password Strength',
    'auth.passwordStrength.weak': 'Weak',
    'auth.passwordStrength.fair': 'Fair',
    'auth.passwordStrength.good': 'Good',
    'auth.passwordStrength.strong': 'Strong',
    'auth.resettingPassword': 'Resetting Password...',
    'auth.passwordResetSuccess': 'Your password has been successfully reset. You can now log in with your new password.',
    'auth.invalidResetToken': 'Invalid or missing reset token. Please request a new password reset link.',
    'auth.enterConfirmPassword': 'Please confirm your password',
    'auth.passwordTooLong': 'Password must not exceed 50 characters',
    'auth.passwordComplexity': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and be 8-50 characters long',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.loading': 'Loading...',
    'validation.required': 'This field is required',
    'validation.passwordTooShort': 'Password must be at least 8 characters',
    'validation.passwordsDoNotMatch': 'Passwords do not match',
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
      warning: '#FFC107',
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

describe('ResetPasswordForm', () => {
  const mockOnResetPassword = jest.fn();

  beforeEach(() => {
    mockOnResetPassword.mockClear();
    mockRouter.push.mockClear();
    mockRouter.replace.mockClear();
    mockT.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderResetPasswordForm = (token = 'valid-token') => {
    mockUseLocalSearchParams.mockReturnValue({ token });
    return render(
      <TestWrapper>
        <ResetPasswordForm onResetPassword={mockOnResetPassword} />
      </TestWrapper>
    );
  };

  it('renders form elements correctly with valid token', () => {
    renderResetPasswordForm();

    expect(screen.getByText('Set New Password')).toBeTruthy();
    expect(screen.getByText('Enter your new password below. Make sure it\'s strong and secure.')).toBeTruthy();
    expect(screen.getByText('New Password')).toBeTruthy();
    expect(screen.getByText('Confirm New Password')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your new password')).toBeTruthy();
    expect(screen.getByPlaceholderText('Confirm your new password')).toBeTruthy();
    expect(screen.getByText('Reset Password')).toBeTruthy();
    expect(screen.getByText('Back to Sign In')).toBeTruthy();
  });

  it('shows error message when token is missing', () => {
    renderResetPasswordForm(undefined);

    expect(screen.getByText('Error')).toBeTruthy();
    expect(screen.getByText('Invalid or missing reset token. Please request a new password reset link.')).toBeTruthy();
    
    // Form should not be visible
    expect(screen.queryByText('New Password')).toBeFalsy();
  });

  it('shows loading state initially when no token provided', () => {
    mockUseLocalSearchParams.mockReturnValue({});
    render(
      <TestWrapper>
        <ResetPasswordForm onResetPassword={mockOnResetPassword} />
      </TestWrapper>
    );

    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('displays validation error for empty password', async () => {
    renderResetPasswordForm();

    const submitButton = screen.getByText('Reset Password');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeTruthy();
    });

    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for password too short', async () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByPlaceholderText('Enter your new password');
    const submitButton = screen.getByText('Reset Password');

    fireEvent.changeText(passwordInput, 'short');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeTruthy();
    });

    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for password too long', async () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByPlaceholderText('Enter your new password');
    const submitButton = screen.getByText('Reset Password');

    const longPassword = 'A'.repeat(51) + 'a1';
    fireEvent.changeText(passwordInput, longPassword);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must not exceed 50 characters')).toBeTruthy();
    });

    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for password complexity', async () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByPlaceholderText('Enter your new password');
    const submitButton = screen.getByText('Reset Password');

    fireEvent.changeText(passwordInput, 'simplepassword'); // No uppercase, no numbers
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one uppercase letter, one lowercase letter, one number, and be 8-50 characters long')).toBeTruthy();
    });

    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for empty confirm password', async () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByPlaceholderText('Enter your new password');
    const submitButton = screen.getByText('Reset Password');

    fireEvent.changeText(passwordInput, 'ValidPass123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please confirm your password')).toBeTruthy();
    });

    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for password mismatch', async () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByPlaceholderText('Enter your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    const submitButton = screen.getByText('Reset Password');

    fireEvent.changeText(passwordInput, 'ValidPass123');
    fireEvent.changeText(confirmPasswordInput, 'DifferentPass123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeTruthy();
    });

    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it('shows password strength indicator', async () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByPlaceholderText('Enter your new password');

    // Test weak password
    fireEvent.changeText(passwordInput, 'weak');
    await waitFor(() => {
      expect(screen.getByText('Password Strength:')).toBeTruthy();
      expect(screen.getByText('Weak')).toBeTruthy();
    });

    // Test strong password
    fireEvent.changeText(passwordInput, 'StrongPass123');
    await waitFor(() => {
      expect(screen.getByText('Strong')).toBeTruthy();
    });
  });

  it('submits form with valid data', async () => {
    mockOnResetPassword.mockResolvedValueOnce(undefined);
    renderResetPasswordForm();

    const passwordInput = screen.getByPlaceholderText('Enter your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    const submitButton = screen.getByText('Reset Password');

    fireEvent.changeText(passwordInput, 'ValidPass123');
    fireEvent.changeText(confirmPasswordInput, 'ValidPass123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnResetPassword).toHaveBeenCalledWith('valid-token', 'ValidPass123');
    });
  });

  it('displays success message and redirects after successful reset', async () => {
    mockOnResetPassword.mockResolvedValueOnce(undefined);
    renderResetPasswordForm();

    const passwordInput = screen.getByPlaceholderText('Enter your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    const submitButton = screen.getByText('Reset Password');

    fireEvent.changeText(passwordInput, 'ValidPass123');
    fireEvent.changeText(confirmPasswordInput, 'ValidPass123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeTruthy();
      expect(screen.getByText('Your password has been successfully reset. You can now log in with your new password.')).toBeTruthy();
    });

    // Fast-forward time to trigger redirect
    jest.advanceTimersByTime(3000);

    expect(mockRouter.replace).toHaveBeenCalledWith('/auth/login');
  });

  it('displays error message on submission failure', async () => {
    const errorMessage = 'Token expired';
    mockOnResetPassword.mockRejectedValueOnce(new Error(errorMessage));
    renderResetPasswordForm();

    const passwordInput = screen.getByPlaceholderText('Enter your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    const submitButton = screen.getByText('Reset Password');

    fireEvent.changeText(passwordInput, 'ValidPass123');
    fireEvent.changeText(confirmPasswordInput, 'ValidPass123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeTruthy();
      expect(screen.getByText(errorMessage)).toBeTruthy();
    });
  });

  it('handles back navigation correctly', () => {
    renderResetPasswordForm();

    const backButton = screen.getByText('Back to Sign In');
    fireEvent.press(backButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
  });

  it('calls submit on enter key press', async () => {
    mockOnResetPassword.mockResolvedValueOnce(undefined);
    renderResetPasswordForm();

    const passwordInput = screen.getByPlaceholderText('Enter your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');

    fireEvent.changeText(passwordInput, 'ValidPass123');
    fireEvent.changeText(confirmPasswordInput, 'ValidPass123');
    fireEvent(confirmPasswordInput, 'submitEditing');

    await waitFor(() => {
      expect(mockOnResetPassword).toHaveBeenCalledWith('valid-token', 'ValidPass123');
    });
  });

  it('shows loading state during submission', async () => {
    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockOnResetPassword.mockReturnValueOnce(promise);

    renderResetPasswordForm();

    const passwordInput = screen.getByPlaceholderText('Enter your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    const submitButton = screen.getByText('Reset Password');

    fireEvent.changeText(passwordInput, 'ValidPass123');
    fireEvent.changeText(confirmPasswordInput, 'ValidPass123');
    fireEvent.press(submitButton);

    // Should show loading text
    await waitFor(() => {
      expect(screen.getByText('Resetting Password...')).toBeTruthy();
    });

    // Resolve the promise
    resolvePromise!();

    await waitFor(() => {
      expect(screen.getByText('Reset Password')).toBeTruthy();
    });
  });

  it('validates token on component mount', () => {
    // Test with invalid token
    mockUseLocalSearchParams.mockReturnValue({ token: '' });
    render(
      <TestWrapper>
        <ResetPasswordForm onResetPassword={mockOnResetPassword} />
      </TestWrapper>
    );

    expect(screen.getByText('Invalid or missing reset token. Please request a new password reset link.')).toBeTruthy();
  });

  it('uses i18n translations correctly', () => {
    renderResetPasswordForm();

    expect(mockT).toHaveBeenCalledWith('auth.setNewPassword', expect.any(Object));
    expect(mockT).toHaveBeenCalledWith('auth.setNewPasswordDescription', expect.any(Object));
    expect(mockT).toHaveBeenCalledWith('auth.newPassword', expect.any(Object));
    expect(mockT).toHaveBeenCalledWith('auth.confirmNewPassword', expect.any(Object));
    expect(mockT).toHaveBeenCalledWith('auth.resetPassword');
    expect(mockT).toHaveBeenCalledWith('auth.backToSignIn', expect.any(Object));
  });

  it('applies proper accessibility attributes', () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByPlaceholderText('Enter your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');

    // Check input properties
    expect(passwordInput.props.secureTextEntry).toBe(true);
    expect(passwordInput.props.autoCapitalize).toBe('none');
    expect(passwordInput.props.autoCorrect).toBe(false);
    expect(passwordInput.props.autoComplete).toBe('new-password');
    expect(passwordInput.props.autoFocus).toBe(true);
    expect(passwordInput.props.returnKeyType).toBe('next');

    expect(confirmPasswordInput.props.secureTextEntry).toBe(true);
    expect(confirmPasswordInput.props.autoCapitalize).toBe('none');
    expect(confirmPasswordInput.props.autoCorrect).toBe(false);
    expect(confirmPasswordInput.props.autoComplete).toBe('new-password');
    expect(confirmPasswordInput.props.returnKeyType).toBe('done');
  });
});