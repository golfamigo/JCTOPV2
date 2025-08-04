import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import LoginPage from './login';
import { useAuthStore } from '../../stores/authStore';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock auth store
jest.mock('../../stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

// Mock LoginForm component
jest.mock('../../components/features/auth/LoginForm', () => {
  return ({ onLoginSuccess, onNavigateToRegister, onGoBack, showBackButton }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    return React.createElement(View, { testID: 'login-form' }, [
      React.createElement(Text, { key: 'title' }, 'Login Form'),
      React.createElement(TouchableOpacity, {
        key: 'login-button',
        testID: 'login-success-button',
        onPress: onLoginSuccess,
      }, React.createElement(Text, null, 'Login')),
      React.createElement(TouchableOpacity, {
        key: 'register-button',
        testID: 'navigate-register-button',
        onPress: onNavigateToRegister,
      }, React.createElement(Text, null, 'Go to Register')),
      showBackButton && React.createElement(TouchableOpacity, {
        key: 'back-button',
        testID: 'back-button',
        onPress: onGoBack,
      }, React.createElement(Text, null, 'Back')),
    ]);
  };
});

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
  });

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        loadAuthState: jest.fn(),
        user: null,
        token: null,
        login: jest.fn(),
        logout: jest.fn(),
        setToken: jest.fn(),
        isTokenExpired: jest.fn(),
        getProfile: jest.fn(),
        updateProfile: jest.fn(),
      });
    });

    it('renders LoginForm component', () => {
      const { getByTestId, getByText } = render(<LoginPage />);
      
      expect(getByTestId('login-form')).toBeTruthy();
      expect(getByText('Login Form')).toBeTruthy();
    });

    it('passes showBackButton prop as true', () => {
      const { getByTestId } = render(<LoginPage />);
      
      expect(getByTestId('back-button')).toBeTruthy();
    });

    it('handles login success navigation', () => {
      const { getByTestId } = render(<LoginPage />);
      
      const loginButton = getByTestId('login-success-button');
      loginButton.props.onPress();
      
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/events');
    });

    it('handles navigation to register page', () => {
      const { getByTestId } = render(<LoginPage />);
      
      const registerButton = getByTestId('navigate-register-button');
      registerButton.props.onPress();
      
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/register');
    });

    it('handles back navigation', () => {
      const { getByTestId } = render(<LoginPage />);
      
      const backButton = getByTestId('back-button');
      backButton.props.onPress();
      
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe('Authenticated State', () => {
    it('redirects to events page when user is authenticated', async () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loadAuthState: jest.fn(),
        user: { id: '1', name: 'Test User', email: 'test@test.com' } as any,
        token: 'mock-token',
        login: jest.fn(),
        logout: jest.fn(),
        setToken: jest.fn(),
        isTokenExpired: jest.fn(),
        getProfile: jest.fn(),
        updateProfile: jest.fn(),
      });

      render(<LoginPage />);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/events');
      });
    });

    it('renders null when authenticated (while redirecting)', () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loadAuthState: jest.fn(),
        user: { id: '1', name: 'Test User', email: 'test@test.com' } as any,
        token: 'mock-token',
        login: jest.fn(),
        logout: jest.fn(),
        setToken: jest.fn(),
        isTokenExpired: jest.fn(),
        getProfile: jest.fn(),
        updateProfile: jest.fn(),
      });

      const { queryByTestId } = render(<LoginPage />);

      expect(queryByTestId('login-form')).toBeNull();
    });
  });

  describe('Layout and Styling', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        loadAuthState: jest.fn(),
        user: null,
        token: null,
        login: jest.fn(),
        logout: jest.fn(),
        setToken: jest.fn(),
        isTokenExpired: jest.fn(),
        getProfile: jest.fn(),
        updateProfile: jest.fn(),
      });
    });

    it('configures ScrollView with correct props', () => {
      const { UNSAFE_root } = render(<LoginPage />);
      
      const scrollView = UNSAFE_root.findByType('ScrollView' as any);
      expect(scrollView).toBeTruthy();
      expect(scrollView.props.keyboardShouldPersistTaps).toBe('handled');
      expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
    });

    it('sets up StatusBar with correct style', () => {
      const { UNSAFE_root } = render(<LoginPage />);
      
      const statusBar = UNSAFE_root.findByType('StatusBar' as any);
      expect(statusBar).toBeTruthy();
      expect(statusBar.props.style).toBe('dark');
    });

    it('uses correct background color', () => {
      const { UNSAFE_root } = render(<LoginPage />);
      
      const container = UNSAFE_root.findByType('View' as any);
      expect(container.props.style).toMatchObject(
        expect.objectContaining({
          backgroundColor: '#F8FAFC',
        })
      );
    });
  });
});