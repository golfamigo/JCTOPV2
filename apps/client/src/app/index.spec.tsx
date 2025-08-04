import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Index from './index';
import { useAuthStore } from '../stores/authStore';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock auth store
jest.mock('../stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('Index Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
  });

  describe('Loading State', () => {
    it('shows loading indicator when auth state is loading', () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
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

      const { getByText, getByTestId } = render(<Index />);

      expect(getByText('載入中...')).toBeTruthy();
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('calls loadAuthState on component mount', () => {
      const mockLoadAuthState = jest.fn();
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        loadAuthState: mockLoadAuthState,
        user: null,
        token: null,
        login: jest.fn(),
        logout: jest.fn(),
        setToken: jest.fn(),
        isTokenExpired: jest.fn(),
        getProfile: jest.fn(),
        updateProfile: jest.fn(),
      });

      render(<Index />);

      expect(mockLoadAuthState).toHaveBeenCalledTimes(1);
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

      render(<Index />);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/events');
      });
    });
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

    it('renders landing page when user is not authenticated', () => {
      const { getByText } = render(<Index />);

      expect(getByText('JCTOP Event Management')).toBeTruthy();
      expect(getByText('歡迎使用 JCTOP 活動管理平台')).toBeTruthy();
      expect(getByText('瀏覽活動')).toBeTruthy();
      expect(getByText('登入 / 註冊')).toBeTruthy();
    });

    it('navigates to events page when browse events button is pressed', () => {
      const { getByText } = render(<Index />);
      
      const browseEventsButton = getByText('瀏覽活動');
      fireEvent.press(browseEventsButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/events');
    });

    it('navigates to auth login page when auth button is pressed', () => {
      const { getByText } = render(<Index />);
      
      const authButton = getByText('登入 / 註冊');
      fireEvent.press(authButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
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

      const { getByText } = render(<Index />);

      // Check that buttons have proper text for screen readers
      expect(getByText('瀏覽活動')).toBeTruthy();
      expect(getByText('登入 / 註冊')).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('applies correct brand colors', () => {
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

      const { UNSAFE_root } = render(<Index />);
      
      // Find TouchableOpacity components (buttons)
      const buttons = UNSAFE_root.findAllByType('TouchableOpacity' as any);
      expect(buttons.length).toBeGreaterThan(0);
      
      // Verify primary button uses brand color
      const primaryButton = buttons[0];
      expect(primaryButton.props.style).toMatchObject(
        expect.objectContaining({
          backgroundColor: '#2563EB',
        })
      );
    });
  });
});