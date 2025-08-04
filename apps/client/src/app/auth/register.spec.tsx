import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import RegisterPage from './register';
import { useAuthStore } from '../../stores/authStore';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock auth store
jest.mock('../../stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

// Mock RegisterForm component
jest.mock('../../components/features/auth/RegisterForm', () => {
  return ({ onRegistrationSuccess, onNavigateToLogin, onGoBack, showBackButton }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    return React.createElement(View, { testID: 'register-form' }, [
      React.createElement(Text, { key: 'title' }, 'Register Form'),
      React.createElement(TouchableOpacity, {
        key: 'register-button',
        testID: 'register-success-button',
        onPress: onRegistrationSuccess,
      }, React.createElement(Text, null, 'Register')),
      React.createElement(TouchableOpacity, {
        key: 'login-button',
        testID: 'navigate-login-button',
        onPress: onNavigateToLogin,
      }, React.createElement(Text, null, 'Go to Login')),
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

describe('RegisterPage Component', () => {
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

    it('renders RegisterForm component', () => {
      const { getByTestId, getByText } = render(<RegisterPage />);
      
      expect(getByTestId('register-form')).toBeTruthy();
      expect(getByText('Register Form')).toBeTruthy();
    });

    it('passes showBackButton prop as true', () => {
      const { getByTestId } = render(<RegisterPage />);
      
      expect(getByTestId('back-button')).toBeTruthy();
    });

    it('handles registration success navigation', () => {
      const { getByTestId } = render(<RegisterPage />);
      
      const registerButton = getByTestId('register-success-button');
      registerButton.props.onPress();
      
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/events');
    });

    it('handles navigation to login page', () => {
      const { getByTestId } = render(<RegisterPage />);
      
      const loginButton = getByTestId('navigate-login-button');
      loginButton.props.onPress();
      
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
    });

    it('handles back navigation', () => {
      const { getByTestId } = render(<RegisterPage />);
      
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

      render(<RegisterPage />);

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

      const { queryByTestId } = render(<RegisterPage />);

      expect(queryByTestId('register-form')).toBeNull();
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
      const { UNSAFE_root } = render(<RegisterPage />);
      
      const scrollView = UNSAFE_root.findByType('ScrollView' as any);
      expect(scrollView).toBeTruthy();
      expect(scrollView.props.keyboardShouldPersistTaps).toBe('handled');
      expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
    });

    it('sets up StatusBar with correct style', () => {
      const { UNSAFE_root } = render(<RegisterPage />);
      
      const statusBar = UNSAFE_root.findByType('StatusBar' as any);
      expect(statusBar).toBeTruthy();
      expect(statusBar.props.style).toBe('dark');
    });

    it('uses correct background color', () => {
      const { UNSAFE_root } = render(<RegisterPage />);
      
      const container = UNSAFE_root.findByType('View' as any);
      expect(container.props.style).toMatchObject(
        expect.objectContaining({
          backgroundColor: '#F8FAFC',
        })
      );
    });
  });
});