import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import authService from '../services/authService';

// Mock authService
jest.mock('../services/authService', () => ({
  login: jest.fn(),
}));

describe('authStore', () => {
  const mockUser = {
    id: 'uuid-123',
    name: 'Test User',
    email: 'test@example.com',
    authProvider: 'email' as const,
    createdAt: new Date('2025-07-30T06:50:55.181Z'),
    updatedAt: new Date('2025-07-30T06:50:55.181Z'),
  };

  const mockLoginResponse = {
    accessToken: 'jwt.token.here',
    user: mockUser,
    message: 'Login successful',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
    });
    
    // Reset AsyncStorage mocks
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
    });
  });

  describe('login', () => {
    it('should login successfully and update state', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      (authService.login as jest.Mock).mockResolvedValue(mockLoginResponse);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const { login } = useAuthStore.getState();
      await login(credentials);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockLoginResponse.accessToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@auth_token', mockLoginResponse.accessToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@auth_user', JSON.stringify(mockUser));
    });

    it('should handle login failure', async () => {
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      const error = new Error('Invalid credentials');
      (authService.login as jest.Mock).mockRejectedValue(error);

      const { login } = useAuthStore.getState();
      
      await expect(login(credentials)).rejects.toThrow('Invalid credentials');

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear state', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: mockUser,
        token: 'jwt.token.here',
        isAuthenticated: true,
        isLoading: false,
      });

      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      const { logout } = useAuthStore.getState();
      await logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['@auth_token', '@auth_user']);
    });

    it('should clear state even if storage removal fails', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: mockUser,
        token: 'jwt.token.here',
        isAuthenticated: true,
        isLoading: false,
      });

      (AsyncStorage.multiRemove as jest.Mock).mockRejectedValue(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { logout } = useAuthStore.getState();
      await logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);

      expect(consoleSpy).toHaveBeenCalledWith('Error during logout:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('loadAuthState', () => {
    it('should load auth state from storage successfully', async () => {
      const storedUser = {
        ...mockUser,
        createdAt: mockUser.createdAt.toISOString(),
        updatedAt: mockUser.updatedAt.toISOString(),
      };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('jwt.token.here') // token
        .mockResolvedValueOnce(JSON.stringify(storedUser)); // user

      const { loadAuthState } = useAuthStore.getState();
      await loadAuthState();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(storedUser);
      expect(state.token).toBe('jwt.token.here');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should clear state if no stored data', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null) // token
        .mockResolvedValueOnce(null); // user

      const { loadAuthState } = useAuthStore.getState();
      await loadAuthState();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { loadAuthState } = useAuthStore.getState();
      await loadAuthState();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);

      expect(consoleSpy).toHaveBeenCalledWith('Error loading auth state:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('setToken', () => {
    it('should update token in state', () => {
      const { setToken } = useAuthStore.getState();
      setToken('new.jwt.token');

      const state = useAuthStore.getState();
      expect(state.token).toBe('new.jwt.token');
    });
  });
});