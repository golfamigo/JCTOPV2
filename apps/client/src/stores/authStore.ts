import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@jctop-event/shared-types';
import authService from '../services/authService';

interface LoginData {
  email: string;
  password: string;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  loadAuthState: () => Promise<void>;
  setToken: (token: string) => void;
  isTokenExpired: (token: string) => boolean;
  getProfile: () => Promise<void>;
  updateProfile: (profileData: UpdateProfileData) => Promise<void>;
}

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials: LoginData) => {
    try {
      const response = await authService.login(credentials);
      
      // Store token and user data securely
      await AsyncStorage.setItem(TOKEN_KEY, response.accessToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
      
      set({
        user: response.user,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Remove token and user data from storage
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear the state even if storage removal fails
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  loadAuthState: async () => {
    try {
      set({ isLoading: true });
      
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser);
        
        // Validate token expiration
        if (get().isTokenExpired(storedToken)) {
          // Token is expired, clear storage and set unauthenticated state
          await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }
        
        set({
          user,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setToken: (token: string) => {
    set({ token });
  },

  // Helper method to validate JWT token expiration
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      // If token parsing fails, consider it expired
      return true;
    }
  },

  getProfile: async () => {
    try {
      const user = await authService.getProfile();
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (profileData: UpdateProfileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
}));

export default useAuthStore;