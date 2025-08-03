import authService from './authService';
import apiClient from './apiClient';

jest.mock('./apiClient');

describe('authService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
    };

    const mockUser = {
      id: 'uuid-123',
      name: 'John Doe',
      email: 'john@example.com',
      authProvider: 'email' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockResponse = {
      user: mockUser,
      message: 'Registration successful',
    };

    it('should call API endpoint with correct data', async () => {
      mockApiClient.post.mockResolvedValue(mockResponse);

      await authService.register(registerData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', registerData);
    });

    it('should return user data on successful registration', async () => {
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.register(registerData);

      expect(result).toEqual(mockUser);
    });

    it('should throw error when API call fails', async () => {
      const error = new Error('Network error');
      mockApiClient.post.mockRejectedValue(error);

      await expect(authService.register(registerData)).rejects.toThrow('Network error');
    });

    it('should handle conflict error for duplicate email', async () => {
      const error = new Error('User with this email already exists');
      mockApiClient.post.mockRejectedValue(error);

      await expect(authService.register(registerData)).rejects.toThrow('User with this email already exists');
    });

    it('should handle validation errors', async () => {
      const error = new Error('Invalid email format');
      mockApiClient.post.mockRejectedValue(error);

      await expect(authService.register(registerData)).rejects.toThrow('Invalid email format');
    });
  });
});