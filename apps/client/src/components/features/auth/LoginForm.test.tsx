import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import LoginForm from './LoginForm';
import i18n from '../../../localization';
import GoogleAuthService from '../../../services/googleAuthService';

// Mock @rneui/themed components
jest.mock('@rneui/themed', () => {
  const React = require('react');
  const { Text: RNText, TextInput, View, TouchableOpacity } = require('react-native');
  
  return {
    Text: React.forwardRef((props: any, ref: any) => <RNText {...props} ref={ref} />),
    Input: React.forwardRef(({ label, value, onChangeText, placeholder, errorMessage, testID, ...props }: any, ref: any) => (
      <View>
        {label && <RNText>{label}</RNText>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          testID={testID}
          ref={ref}
          {...props}
        />
        {errorMessage && <RNText>{errorMessage}</RNText>}
      </View>
    )),
    Button: React.forwardRef(({ title, onPress, loading, disabled, testID, ...props }: any, ref: any) => (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} testID={testID} ref={ref} {...props}>
        <RNText>{loading ? 'Loading...' : title}</RNText>
      </TouchableOpacity>
    )),
    Card: React.forwardRef(({ children, containerStyle, ...props }: any, ref: any) => (
      <View style={containerStyle} ref={ref} {...props}>{children}</View>
    )),
    Divider: React.forwardRef(({ style, ...props }: any, ref: any) => (
      <View style={[{ height: 1, backgroundColor: 'gray' }, style]} ref={ref} {...props} />
    )),
    SocialIcon: React.forwardRef(({ title, onPress, loading, disabled, testID, ...props }: any, ref: any) => (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} testID={testID} ref={ref} {...props}>
        <RNText>{loading ? 'Loading...' : title}</RNText>
      </TouchableOpacity>
    )),
  };
});

// Mock theme hook
jest.mock('../../../theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      surface: '#F8F9FA',
      danger: '#DC3545',
      white: '#FFFFFF',
      textSecondary: '#6C757D',
    },
    spacing: {
      xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
    },
    typography: {
      h1: { fontSize: 24, fontWeight: 'bold', color: '#212529' },
    },
  }),
}));

// Mock GoogleAuthService
jest.mock('../../../services/googleAuthService', () => ({
  signInWithGoogle: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: ({ children, href, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

const mockGoogleAuthService = GoogleAuthService as jest.Mocked<typeof GoogleAuthService>;

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    {children}
  </I18nextProvider>
);

describe('LoginForm', () => {
  const mockOnLogin = jest.fn();
  const mockOnGoogleSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnLogin.mockClear();
    mockOnGoogleSignIn.mockClear();
    mockGoogleAuthService.signInWithGoogle.mockClear();
  });

  const renderLoginForm = () => {
    return render(
      <TestWrapper>
        <LoginForm onLogin={mockOnLogin} onGoogleSignIn={mockOnGoogleSignIn} />
      </TestWrapper>
    );
  };

  it('renders without errors', () => {
    renderLoginForm();
    expect(screen.getAllByText('登入')).toHaveLength(2); // Title and button both have "登入"
  });

  it('displays all form elements', () => {
    renderLoginForm();
    
    expect(screen.getAllByText('登入')).toHaveLength(2); // Title and button
    expect(screen.getByTestId('email-input')).toBeTruthy();
    expect(screen.getByTestId('password-input')).toBeTruthy();
    expect(screen.getByTestId('signin-button')).toBeTruthy();
    expect(screen.getByTestId('google-signin-button')).toBeTruthy();
    expect(screen.getByText('忘記密碼？')).toBeTruthy();
    expect(screen.getByText('或者')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    renderLoginForm();
    
    const submitButton = screen.getByTestId('signin-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText('此欄位為必填')).toHaveLength(2); // Both email and password required
    });
    
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    renderLoginForm();
    
    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('signin-button');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('請輸入有效的電子信箱')).toBeTruthy();
    });
    
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('calls onLogin with correct data when form is valid', async () => {
    renderLoginForm();
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('signin-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows loading state during login', async () => {
    mockOnLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderLoginForm();
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('signin-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(submitButton);

    expect(screen.getByText('Loading...')).toBeTruthy(); // Our mock shows "Loading..." instead of Chinese
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  it('displays error message when login fails', async () => {
    const errorMessage = 'Login failed';
    mockOnLogin.mockRejectedValue(new Error(errorMessage));
    
    renderLoginForm();
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('signin-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('登入失敗！')).toBeTruthy();
      expect(screen.getByText(errorMessage)).toBeTruthy();
    });
  });

  it('handles Google Sign-In successfully', async () => {
    const mockAccessToken = 'mock-access-token';
    mockGoogleAuthService.signInWithGoogle.mockResolvedValue({
      success: true,
      accessToken: mockAccessToken,
    });
    
    renderLoginForm();
    
    const googleButton = screen.getByTestId('google-signin-button');
    fireEvent.press(googleButton);

    await waitFor(() => {
      expect(mockGoogleAuthService.signInWithGoogle).toHaveBeenCalled();
      expect(mockOnGoogleSignIn).toHaveBeenCalledWith(mockAccessToken);
    });
  });

  it('handles Google Sign-In failure', async () => {
    const errorMessage = 'Google sign-in failed';
    mockGoogleAuthService.signInWithGoogle.mockResolvedValue({
      success: false,
      error: errorMessage,
    });
    
    renderLoginForm();
    
    const googleButton = screen.getByTestId('google-signin-button');
    fireEvent.press(googleButton);

    await waitFor(() => {
      expect(mockGoogleAuthService.signInWithGoogle).toHaveBeenCalled();
      expect(screen.getByText('登入失敗！')).toBeTruthy();
      expect(screen.getByText(errorMessage)).toBeTruthy();
    });
    
    expect(mockOnGoogleSignIn).not.toHaveBeenCalled();
  });

  it('shows Google Sign-In loading state', async () => {
    mockGoogleAuthService.signInWithGoogle.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, accessToken: 'token' }), 100))
    );
    
    renderLoginForm();
    
    const googleButton = screen.getByTestId('google-signin-button');
    fireEvent.press(googleButton);

    expect(screen.getByText('Loading...')).toBeTruthy(); // Our mock shows "Loading..." instead of Chinese
    
    await waitFor(() => {
      expect(mockGoogleAuthService.signInWithGoogle).toHaveBeenCalled();
    });
  });

  it('disables buttons during loading states', async () => {
    mockOnLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderLoginForm();
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('signin-button');
    const googleButton = screen.getByTestId('google-signin-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(submitButton);

    // Both buttons should be disabled during login loading
    expect(submitButton).toBeDisabled();
    expect(googleButton).toBeDisabled();
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  it('maintains form values during interaction', () => {
    renderLoginForm();
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'mypassword');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('mypassword');
  });

  it('clears error when new input is provided after error', async () => {
    renderLoginForm();
    
    const submitButton = screen.getByTestId('signin-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText('此欄位為必填')).toHaveLength(2); // Both errors initially
    });

    const emailInput = screen.getByTestId('email-input');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);

    await waitFor(() => {
      // Email error should be cleared, only password error should remain
      const errorElements = screen.queryAllByText('此欄位為必填');
      expect(errorElements).toHaveLength(1); // Only password error
    });
  });
});