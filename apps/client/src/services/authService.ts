import apiClient from './apiClient';
import { User } from '@jctop-event/shared-types';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  message: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: User;
  message: string;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
}

interface ProfileResponse {
  user: User;
  message: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const authService = {
  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      return response.user;
    } catch (error) {
      // Re-throw with more specific error message for registration failures
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Registration failed. Please try again.');
    }
  },
  
  async login(userData: LoginData): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', userData);
      return response;
    } catch (error) {
      // Re-throw with more specific error message for login failures
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<ProfileResponse>('/auth/profile');
      return response.user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch profile. Please try again.');
    }
  },

  async updateProfile(userData: UpdateProfileData): Promise<User> {
    try {
      const response = await apiClient.put<ProfileResponse>('/auth/profile', userData);
      return response.user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update profile. Please try again.');
    }
  },

  async googleSignIn(): Promise<LoginResponse> {
    try {
      const response = await apiClient.get<LoginResponse>('/auth/google');
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Google sign-in failed. Please try again.');
    }
  },

  async handleGoogleCallback(code: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/google/callback', { code });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Google authentication failed. Please try again.');
    }
  },

  async forgotPassword(email: string): Promise<string> {
    try {
      const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
      return response.message;
    } catch (error: any) {
      // Handle specific error cases
      if (error?.response?.status === 429) {
        throw new Error('Too many password reset requests. Please wait before trying again.');
      }
      if (error?.response?.status === 400) {
        throw new Error('Please provide a valid email address.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to send password reset email. Please try again.');
    }
  },

  async resetPassword(token: string, password: string): Promise<string> {
    try {
      const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', { token, password });
      return response.message;
    } catch (error: any) {
      // Handle specific error cases
      if (error?.response?.status === 400) {
        const message = error?.response?.data?.message;
        if (message?.includes('expired')) {
          throw new Error('This password reset link has expired. Please request a new one.');
        }
        if (message?.includes('invalid')) {
          throw new Error('This password reset link is invalid. Please request a new one.');
        }
        throw new Error('Password does not meet requirements. Please check the password criteria.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to reset password. Please try again.');
    }
  },
};

export default authService;