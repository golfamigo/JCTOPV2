import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NavigationContainer } from '@react-navigation/native';
import ResetPasswordForm from './ResetPasswordForm';

// Mock navigation
const mockNavigate = jest.fn();
let mockRouteParams = { token: 'valid-token' };

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ params: mockRouteParams }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    {children}
  </NavigationContainer>
);

describe('ResetPasswordForm', () => {
  const mockOnResetPassword = jest.fn();

  beforeEach(() => {
    mockOnResetPassword.mockClear();
    mockNavigate.mockClear();
  });

  const renderResetPasswordForm = () => {
    return render(
      <TestWrapper>
        <ResetPasswordForm onResetPassword={mockOnResetPassword} />
      </TestWrapper>
    );
  };

  it('renders form elements correctly with valid token', () => {
    renderResetPasswordForm();

    expect(screen.getByText('Set New Password')).toBeInTheDocument();
    expect(screen.getByText(/Enter your new password below/)).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
    expect(screen.getByText('Back to Sign In')).toBeInTheDocument();
  });

  it('displays validation errors for empty passwords', async () => {
    renderResetPasswordForm();

    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });

    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for password too short', async () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByLabelText('New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });

    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for password too long', async () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByLabelText('New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    const longPassword = 'a'.repeat(51); // Over 50 characters
    fireEvent.change(passwordInput, { target: { value: longPassword } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must not exceed 50 characters')).toBeInTheDocument();
    });

    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for weak password', async () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByLabelText('New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    fireEvent.change(passwordInput, { target: { value: 'weakpassword' } }); // Missing uppercase and number
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Password must contain at least one uppercase letter/)).toBeInTheDocument();
    });

    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for password mismatch', async () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it('shows password strength indicator', async () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByLabelText('New Password');

    // Test weak password
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    await waitFor(() => {
      expect(screen.getByText('Password Strength:')).toBeInTheDocument();
      expect(screen.getByText('Weak')).toBeInTheDocument();
    });

    // Test strong password
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123' } });
    await waitFor(() => {
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });
  });

  it('submits form with valid passwords', async () => {
    mockOnResetPassword.mockResolvedValue(undefined);
    renderResetPasswordForm();

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    const validPassword = 'ValidPassword123';
    fireEvent.change(passwordInput, { target: { value: validPassword } });
    fireEvent.change(confirmPasswordInput, { target: { value: validPassword } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnResetPassword).toHaveBeenCalledWith('valid-token', validPassword);
    });
  });

  it('handles Enter key press for form submission', async () => {
    mockOnResetPassword.mockResolvedValue(undefined);
    renderResetPasswordForm();

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

    const validPassword = 'ValidPassword123';
    fireEvent.change(passwordInput, { target: { value: validPassword } });
    fireEvent.change(confirmPasswordInput, { target: { value: validPassword } });
    fireEvent.keyPress(confirmPasswordInput, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(mockOnResetPassword).toHaveBeenCalledWith('valid-token', validPassword);
    });
  });

  it('displays success message and redirects after successful reset', async () => {
    mockOnResetPassword.mockResolvedValue(undefined);
    renderResetPasswordForm();

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    const validPassword = 'ValidPassword123';
    fireEvent.change(passwordInput, { target: { value: validPassword } });
    fireEvent.change(confirmPasswordInput, { target: { value: validPassword } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText(/Your password has been successfully reset/)).toBeInTheDocument();
    });

    // Wait for redirect timeout
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 4000 });
  });

  it('displays error message on submission failure', async () => {
    const errorMessage = 'Invalid or expired reset token';
    mockOnResetPassword.mockRejectedValue(new Error(errorMessage));
    renderResetPasswordForm();

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    const validPassword = 'ValidPassword123';
    fireEvent.change(passwordInput, { target: { value: validPassword } });
    fireEvent.change(confirmPasswordInput, { target: { value: validPassword } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockOnResetPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderResetPasswordForm();

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    const validPassword = 'ValidPassword123';
    fireEvent.change(passwordInput, { target: { value: validPassword } });
    fireEvent.change(confirmPasswordInput, { target: { value: validPassword } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Resetting Password...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('Resetting Password...')).not.toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
    expect(passwordInput).toHaveFocus(); // autoFocus should result in the element being focused
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
    expect(submitButton).toHaveAttribute('type', 'button');
  });

  it('back to sign in link has correct href', () => {
    renderResetPasswordForm();

    const backLink = screen.getByText('Back to Sign In');
    expect(backLink.closest('a')).toHaveAttribute('href', '/login');
  });
});

describe('ResetPasswordForm without token', () => {
  beforeEach(() => {
    // Configure the mock to return empty search params (no token)
    mockSearchParams = new URLSearchParams('');
  });

  afterEach(() => {
    // Reset to default token for other tests
    mockSearchParams = new URLSearchParams('token=valid-token');
  });

  it('displays error message when token is missing', async () => {
    render(
      <ChakraProvider>
        <ResetPasswordForm onResetPassword={jest.fn()} />
      </ChakraProvider>
    );

    // Wait for the component to process the missing token
    await waitFor(() => {
      expect(screen.getByText('Error!')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Invalid or missing reset token/)).toBeInTheDocument();

    // Form fields should not be visible when there's an error message
    expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Confirm New Password')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset Password' })).not.toBeInTheDocument();
  });
});