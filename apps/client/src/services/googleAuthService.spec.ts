// Mock expo virtual env
jest.mock('expo/virtual/env', () => ({
  EXPO_PUBLIC_API_BASE_URL: 'http://localhost:3001/api/v1'
}), { virtual: true });

// Mock react-native Linking BEFORE importing the service
jest.mock('react-native', () => ({
  Linking: {
    addEventListener: jest.fn(),
    removeAllListeners: jest.fn(),
    getInitialURL: jest.fn().mockResolvedValue(null),
    openURL: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock environment variables
Object.defineProperty(process.env, 'EXPO_PUBLIC_API_BASE_URL', {
  value: 'http://localhost:3001/api/v1'
});

import { Linking } from 'react-native';
import googleAuthService, { GoogleAuthResult } from './googleAuthService';

const MockLinking = Linking as jest.Mocked<typeof Linking>;

describe('GoogleAuthService', () => {
  let service: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the singleton instance for each test
    (googleAuthService.constructor as any).instance = null;
    service = googleAuthService;
    
    MockLinking.getInitialURL.mockResolvedValue(null);
    MockLinking.openURL.mockResolvedValue(undefined);
  });

  afterEach(() => {
    service.cleanup();
  });

  it('should be a singleton', () => {
    const instance1 = googleAuthService;
    const instance2 = googleAuthService;
    expect(instance1).toBe(instance2);
  });

  it('should setup deep link listener on initialization', () => {
    expect(MockLinking.addEventListener).toHaveBeenCalledWith('url', expect.any(Function));
    expect(MockLinking.getInitialURL).toHaveBeenCalled();
  });

  it('should initiate Google sign-in flow', async () => {
    const signInPromise = service.signInWithGoogle();
    
    expect(MockLinking.openURL).toHaveBeenCalledWith(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/google`
    );

    // Simulate timeout to prevent hanging test
    setTimeout(() => {
      // Simulate deep link callback
      const mockHandler = MockLinking.addEventListener.mock.calls[0][1];
      mockHandler({ 
        url: 'com.jctopevent.client://auth/callback?token=test-token&success=true' 
      });
    }, 100);

    const result = await signInPromise;
    expect(result).toEqual({
      success: true,
      accessToken: 'test-token',
    });
  });

  it('should handle authentication failure via deep link', async () => {
    const signInPromise = service.signInWithGoogle();

    setTimeout(() => {
      const mockHandler = MockLinking.addEventListener.mock.calls[0][1];
      mockHandler({ 
        url: 'com.jctopevent.client://auth/callback?error=authentication_failed&success=false' 
      });
    }, 100);

    const result = await signInPromise;
    expect(result).toEqual({
      success: false,
      error: 'authentication_failed',
    });
  });

  it('should handle timeout when no response is received', async () => {
    // Mock shorter timeout for testing
    jest.useFakeTimers();
    
    const signInPromise = service.signInWithGoogle();
    
    // Fast-forward time to trigger timeout
    jest.advanceTimersByTime(300000); // 5 minutes
    
    const result = await signInPromise;
    expect(result).toEqual({
      success: false,
      error: 'Authentication timeout',
    });
    
    jest.useRealTimers();
  });

  it('should handle URL opening errors', async () => {
    MockLinking.openURL.mockRejectedValue(new Error('Cannot open URL'));

    await expect(service.signInWithGoogle()).rejects.toThrow(
      'Failed to open Google sign-in: Cannot open URL'
    );
  });

  it('should ignore non-auth deep links', async () => {
    const signInPromise = service.signInWithGoogle();

    setTimeout(() => {
      const mockHandler = MockLinking.addEventListener.mock.calls[0][1];
      // Send a non-auth deep link
      mockHandler({ url: 'com.jctopevent.client://other/path' });
      
      // Then send the real auth callback
      mockHandler({ 
        url: 'com.jctopevent.client://auth/callback?token=test-token&success=true' 
      });
    }, 100);

    const result = await signInPromise;
    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('test-token');
  });

  it('should cleanup event listeners', () => {
    service.cleanup();
    expect(MockLinking.removeAllListeners).toHaveBeenCalledWith('url');
  });

  it('should handle initial URL on app launch', async () => {
    MockLinking.getInitialURL.mockResolvedValue(
      'com.jctopevent.client://auth/callback?token=initial-token&success=true'
    );

    // Create new instance to trigger initial URL handling
    (googleAuthService.constructor as any).instance = null;
    const newService = googleAuthService;

    // Wait for initial URL processing
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(MockLinking.getInitialURL).toHaveBeenCalled();
  });

  it('should parse URL parameters correctly', async () => {
    const signInPromise = service.signInWithGoogle();

    setTimeout(() => {
      const mockHandler = MockLinking.addEventListener.mock.calls[0][1];
      mockHandler({ 
        url: 'com.jctopevent.client://auth/callback?token=abc123&success=true&extra=ignored' 
      });
    }, 100);

    const result = await signInPromise;
    expect(result).toEqual({
      success: true,
      accessToken: 'abc123',
    });
  });
});