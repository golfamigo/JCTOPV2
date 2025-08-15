import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { TestThemeProvider } from '../../../test-utils/theme-wrapper';
import LoginForm from './LoginForm';

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TestThemeProvider>{children}</TestThemeProvider>
);

describe('LoginForm', () => {
  const mockOnLogin = jest.fn();
  const mockOnGoogleSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByRole } = render(
      <TestWrapper>
        <LoginForm onLogin={mockOnLogin} onGoogleSignIn={mockOnGoogleSignIn} />
      </TestWrapper>
    );

    expect(getByRole('button')).toHaveTextContent('Sign In');
    expect(getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const { getByText, getByRole } = render(
      <TestWrapper>
        <LoginForm onLogin={mockOnLogin} onGoogleSignIn={mockOnGoogleSignIn} />
      </TestWrapper>
    );

    const submitButton = getByRole('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText('Email is required')).toBeInTheDocument();
      expect(getByText('Password is required')).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email format', async () => {
    const { getByPlaceholderText, getByText, getByRole } = render(
      <TestWrapper>
        <LoginForm onLogin={mockOnLogin} onGoogleSignIn={mockOnGoogleSignIn} />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Enter your email');
    const submitButton = getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText('Please provide a valid email address')).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('calls onLogin with correct data when form is valid', async () => {
    mockOnLogin.mockResolvedValueOnce(undefined);

    const { getByPlaceholderText, getByRole } = render(
      <TestWrapper>
        <LoginForm onLogin={mockOnLogin} onGoogleSignIn={mockOnGoogleSignIn} />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const submitButton = getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows loading state during submission', async () => {
    const mockOnLoginPending = jest.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));

    const { getByPlaceholderText, getByRole, getByText } = render(
      <TestWrapper>
        <LoginForm onLogin={mockOnLoginPending} onGoogleSignIn={mockOnGoogleSignIn} />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const submitButton = getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Check loading state
    expect(getByText('Signing In...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Sign In')).toBeInTheDocument();
    });
  });

  it('shows error alert on login failure', async () => {
    const error = new Error('Login failed');
    mockOnLogin.mockRejectedValueOnce(error);

    const { getByPlaceholderText, getByRole, getByText } = render(
      <TestWrapper>
        <LoginForm onLogin={mockOnLogin} onGoogleSignIn={mockOnGoogleSignIn} />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const submitButton = getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText('Login Failed!')).toBeInTheDocument();
      expect(getByText('Login failed')).toBeInTheDocument();
    });
  });

  it('disables button during loading', async () => {
    const mockOnLoginPending = jest.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));

    const { getByPlaceholderText, getByRole } = render(
      <TestWrapper>
        <LoginForm onLogin={mockOnLoginPending} onGoogleSignIn={mockOnGoogleSignIn} />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const submitButton = getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();
    
    // Try to click again, should not call onLogin twice
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnLoginPending).toHaveBeenCalledTimes(1);
    });
  });
});