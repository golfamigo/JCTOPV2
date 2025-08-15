import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NavigationContainer } from '@react-navigation/native';
import ForgotPasswordForm from './ForgotPasswordForm';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    {children}
  </NavigationContainer>
);

describe('ForgotPasswordForm', () => {
  const mockOnForgotPassword = jest.fn();

  beforeEach(() => {
    mockOnForgotPassword.mockClear();
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

    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByText(/Enter your email address and we'll send you a link/)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
    expect(screen.getByText('Back to Sign In')).toBeInTheDocument();
  });

  it('displays validation error for empty email', async () => {
    renderForgotPasswordForm();

    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    expect(mockOnForgotPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for invalid email format', async () => {
    renderForgotPasswordForm();

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please provide a valid email address')).toBeInTheDocument();
    });

    expect(mockOnForgotPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for email exceeding max length', async () => {
    renderForgotPasswordForm();

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    const longEmail = 'a'.repeat(90) + '@example.com'; // Over 100 characters
    fireEvent.change(emailInput, { target: { value: longEmail } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email must not exceed 100 characters')).toBeInTheDocument();
    });

    expect(mockOnForgotPassword).not.toHaveBeenCalled();
  });

  it('submits form with valid email', async () => {
    mockOnForgotPassword.mockResolvedValue(undefined);
    renderForgotPasswordForm();

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnForgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('handles Enter key press for form submission', async () => {
    mockOnForgotPassword.mockResolvedValue(undefined);
    renderForgotPasswordForm();

    const emailInput = screen.getByLabelText('Email');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.keyPress(emailInput, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(mockOnForgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('displays success message after successful submission', async () => {
    mockOnForgotPassword.mockResolvedValue(undefined);
    renderForgotPasswordForm();

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email Sent!')).toBeInTheDocument();
      expect(screen.getByText(/If an account with that email address exists/)).toBeInTheDocument();
    });

    // Check that email input is cleared
    expect(emailInput).toHaveValue('');
  });

  it('displays error message on submission failure', async () => {
    const errorMessage = 'Failed to send reset email';
    mockOnForgotPassword.mockRejectedValue(new Error(errorMessage));
    renderForgotPasswordForm();

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('handles unknown error objects', async () => {
    mockOnForgotPassword.mockRejectedValue('Unknown error');
    renderForgotPasswordForm();

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockOnForgotPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderForgotPasswordForm();

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('Sending...')).not.toBeInTheDocument();
    });
  });

  it('clears previous errors when new submission starts', async () => {
    mockOnForgotPassword
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce(undefined);
    
    renderForgotPasswordForm();

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    // First submission with error
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument();
    });

    // Second submission should clear error
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    renderForgotPasswordForm();

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(emailInput).toHaveFocus(); // autoFocus should result in the element being focused
    expect(submitButton).toHaveAttribute('type', 'button');
  });

  it('back to sign in link has correct href', () => {
    renderForgotPasswordForm();

    const backLink = screen.getByText('Back to Sign In');
    expect(backLink.closest('a')).toHaveAttribute('href', '/login');
  });
});