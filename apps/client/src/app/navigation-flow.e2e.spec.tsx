import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

// Import the components we're testing
import Index from './index';
import LoginPage from './auth/login';
import RegisterPage from './auth/register';
import EventsPage from './(tabs)/events';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  Stack: ({ children, screenOptions }: any) => React.createElement('Stack', { screenOptions }, children),
  Tabs: ({ children, screenOptions }: any) => React.createElement('Tabs', { screenOptions }, children),
}));

// Mock auth store
jest.mock('../stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

// Mock Chakra UI (removed since we're not using ChakraUI anymore)

// Mock components
jest.mock('../components/features/auth/LoginForm', () => {
  return ({ onLoginSuccess }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    return React.createElement(View, { testID: 'login-form' }, [
      React.createElement(Text, { key: 'title' }, 'Login Form'),
      React.createElement(TouchableOpacity, {
        key: 'login-button',
        testID: 'mock-login-button',
        onPress: () => {
          // Simulate successful login
          onLoginSuccess();
        },
      }, React.createElement(Text, null, 'Login')),
    ]);
  };
});

jest.mock('../components/features/auth/RegisterForm', () => {
  return ({ onRegistrationSuccess }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    return React.createElement(View, { testID: 'register-form' }, [
      React.createElement(Text, { key: 'title' }, 'Register Form'),
      React.createElement(TouchableOpacity, {
        key: 'register-button',
        testID: 'mock-register-button',
        onPress: () => {
          // Simulate successful registration
          onRegistrationSuccess();
        },
      }, React.createElement(Text, null, 'Register')),
    ]);
  };
});

jest.mock('../components/features/event/EventsList', () => {
  return ({ onEventClick }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    return React.createElement(View, { testID: 'events-list' }, [
      React.createElement(Text, { key: 'title' }, 'Events List'),
      React.createElement(TouchableOpacity, {
        key: 'event-item',
        testID: 'mock-event-item',
        onPress: () => onEventClick('test-event-id'),
      }, React.createElement(Text, null, 'Test Event')),
    ]);
  };
});

jest.mock('../theme', () => ({ colors: { primary: '#2563EB' } }));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('Navigation Flow E2E Tests', () => {
  let mockAuthState: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
    
    // Default unauthenticated state
    mockAuthState = {
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
    };
    
    mockUseAuthStore.mockReturnValue(mockAuthState);
  });

  describe('Unauthenticated User Flow', () => {
    it('should navigate from landing page to login to events after authentication', async () => {
      // Step 1: Render landing page
      const { getByText, rerender } = render(<Index />);
      
      expect(getByText('JCTOP Event Management')).toBeTruthy();
      expect(getByText('登入 / 註冊')).toBeTruthy();
      
      // Step 2: Click login button
      const loginButton = getByText('登入 / 註冊');
      fireEvent.press(loginButton);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
      
      // Step 3: Simulate navigation to login page
      const { getByTestId: getLoginTestId } = render(<LoginPage />);
      expect(getLoginTestId('login-form')).toBeTruthy();
      
      // Step 4: Perform login
      const mockLoginButton = getLoginTestId('mock-login-button');
      fireEvent.press(mockLoginButton);
      
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/events');
      
      // Step 5: Simulate authentication state change
      mockAuthState.isAuthenticated = true;
      mockAuthState.user = { id: '1', name: 'Test User', email: 'test@test.com' };
      mockAuthState.token = 'mock-token';
      mockUseAuthStore.mockReturnValue(mockAuthState);
      
      // Step 6: Verify landing page redirects when authenticated
      rerender(<Index />);
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/events');
    });

    it('should navigate from landing page to register to events after registration', async () => {
      // Step 1: Start at landing page and navigate to register via login page
      const { getByText } = render(<Index />);
      
      const loginButton = getByText('登入 / 註冊');
      fireEvent.press(loginButton);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
      
      // Step 2: Navigate to register page
      const { getByTestId: getRegisterTestId } = render(<RegisterPage />);
      expect(getRegisterTestId('register-form')).toBeTruthy();
      
      // Step 3: Perform registration
      const mockRegisterButton = getRegisterTestId('mock-register-button');
      fireEvent.press(mockRegisterButton);
      
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/events');
    });

    it('should allow direct access to events page without authentication', () => {
      const { getByText } = render(<Index />);
      
      const browseEventsButton = getByText('瀏覽活動');
      fireEvent.press(browseEventsButton);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/events');
    });
  });

  describe('Authenticated User Flow', () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.user = { id: '1', name: 'Test User', email: 'test@test.com' };
      mockAuthState.token = 'mock-token';
      mockUseAuthStore.mockReturnValue(mockAuthState);
    });

    it('should redirect authenticated users directly to events page', async () => {
      render(<Index />);
      
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/events');
      });
    });

    it('should redirect authenticated users away from auth pages', async () => {
      // Try to access login page when authenticated
      render(<LoginPage />);
      
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/events');
      });
      
      // Try to access register page when authenticated
      render(<RegisterPage />);
      
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/events');
      });
    });

    it('should allow navigation within events section', () => {
      const { getByTestId } = render(<EventsPage />);
      
      const eventItem = getByTestId('mock-event-item');
      fireEvent.press(eventItem);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/event/test-event-id/register');
    });
  });

  describe('Loading States', () => {
    it('should show loading state while checking authentication', () => {
      mockAuthState.isLoading = true;
      mockUseAuthStore.mockReturnValue(mockAuthState);
      
      const { getByTestId, getByText } = render(<Index />);
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
      expect(getByText('載入中...')).toBeTruthy();
    });

    it('should hide loading state after authentication check completes', () => {
      // Start with loading
      mockAuthState.isLoading = true;
      mockUseAuthStore.mockReturnValue(mockAuthState);
      
      const { getByTestId, rerender, queryByTestId } = render(<Index />);
      expect(getByTestId('loading-indicator')).toBeTruthy();
      
      // Finish loading
      mockAuthState.isLoading = false;
      mockUseAuthStore.mockReturnValue(mockAuthState);
      
      rerender(<Index />);
      expect(queryByTestId('loading-indicator')).toBeNull();
    });
  });

  describe('Navigation Guards', () => {
    it('should call loadAuthState on app initialization', () => {
      const mockLoadAuthState = jest.fn();
      mockAuthState.loadAuthState = mockLoadAuthState;
      mockUseAuthStore.mockReturnValue(mockAuthState);
      
      render(<Index />);
      
      expect(mockLoadAuthState).toHaveBeenCalledTimes(1);
    });

    it('should prevent access to auth pages when authenticated', () => {
      mockAuthState.isAuthenticated = true;
      mockUseAuthStore.mockReturnValue(mockAuthState);
      
      const { queryByTestId: queryLoginTestId } = render(<LoginPage />);
      const { queryByTestId: queryRegisterTestId } = render(<RegisterPage />);
      
      expect(queryLoginTestId('login-form')).toBeNull();
      expect(queryRegisterTestId('register-form')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle auth state errors gracefully', () => {
      mockAuthState.loadAuthState = jest.fn().mockRejectedValue(new Error('Auth error'));
      mockUseAuthStore.mockReturnValue(mockAuthState);
      
      // Should not crash when auth fails
      expect(() => render(<Index />)).not.toThrow();
    });

    it('should handle navigation errors gracefully', () => {
      mockRouter.push = jest.fn().mockImplementation(() => {
        throw new Error('Navigation error');
      });
      
      const { getByText } = render(<Index />);
      
      // Should not crash when navigation fails
      expect(() => {
        const button = getByText('瀏覽活動');
        fireEvent.press(button);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper navigation structure for screen readers', () => {
      const { getByText } = render(<Index />);
      
      // Check that navigation buttons are properly labeled
      expect(getByText('瀏覽活動')).toBeTruthy();
      expect(getByText('登入 / 註冊')).toBeTruthy();
    });

    it('should provide proper loading feedback', () => {
      mockAuthState.isLoading = true;
      mockUseAuthStore.mockReturnValue(mockAuthState);
      
      const { getByText, getByTestId } = render(<Index />);
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
      expect(getByText('載入中...')).toBeTruthy();
    });
  });
});