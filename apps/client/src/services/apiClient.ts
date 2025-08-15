import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/authStore';

// Configure API base URL based on environment
const getApiBaseUrl = () => {
  // Check if we have an environment variable set
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // For local development, use local backend
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3000/api/v1';
  }
  
  // For production, use Zeabur backend
  return 'https://jctop.zeabur.app/api/v1';
};

const API_BASE_URL = getApiBaseUrl();
const TOKEN_KEY = '@auth_token';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token && useAuthStore.getState().isTokenExpired(token)) {
        // Token is expired, clear it and return null
        await this.handleAuthError();
        return null;
      }
      return token;
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // Handle authentication errors
        if (response.status === 401) {
          // Token expired or invalid, redirect to login
          await this.handleAuthError();
          throw new Error('Authentication failed. Please log in again.');
        }
      } catch (jsonError) {
        // If JSON parsing fails, check for auth error status
        if (response.status === 401) {
          await this.handleAuthError();
          throw new Error('Authentication failed. Please log in again.');
        }
      }
      throw new Error(errorMessage);
    }
    
    try {
      return await response.json();
    } catch (error) {
      throw new Error('Invalid response format');
    }
  }

  private async handleAuthError(): Promise<void> {
    try {
      // Clear stored authentication data
      await AsyncStorage.multiRemove([TOKEN_KEY, '@auth_user']);
      
      // Update auth store to reflect unauthenticated state
      useAuthStore.getState().logout();
      
      console.warn('Authentication error: Token expired or invalid');
    } catch (error) {
      console.error('Error handling auth error:', error);
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const authHeaders = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers: {
        ...authHeaders,
        ...options?.headers,
      },
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const authHeaders = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        ...authHeaders,
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const authHeaders = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers: {
        ...authHeaders,
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const authHeaders = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers: {
        ...authHeaders,
        ...options?.headers,
      },
    });
    return this.handleResponse<T>(response);
  }
}

const apiClient = new ApiClient();
export default apiClient;