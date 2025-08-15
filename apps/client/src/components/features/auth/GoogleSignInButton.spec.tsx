import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GoogleSignInButton from './GoogleSignInButton';

// Mock environment variables
Object.defineProperty(process.env, 'EXPO_PUBLIC_API_BASE_URL', {
  value: 'http://localhost:3001/api/v1'
});

// Mock GoogleAuthService  
const mockSignInWithGoogle = jest.fn();
jest.mock('../../../services/googleAuthService', () => ({
  __esModule: true,
  default: {
    signInWithGoogle: mockSignInWithGoogle,
  },
}));

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('GoogleSignInButton', () => {
  const mockOnGoogleSignIn = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Google Sign-In button', () => {
    renderWithChakra(
      <GoogleSignInButton onGoogleSignIn={mockOnGoogleSignIn} />
    );

    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('should display loading state when isLoading is true', () => {
    renderWithChakra(
      <GoogleSignInButton onGoogleSignIn={mockOnGoogleSignIn} isLoading={true} />
    );

    expect(screen.getByText('Signing in with Google...')).toBeInTheDocument();
  });

  it('should call GoogleAuthService when button is clicked', async () => {
    mockSignInWithGoogle.mockResolvedValue({
      success: true,
      accessToken: 'test-access-token',
    });

    renderWithChakra(
      <GoogleSignInButton onGoogleSignIn={mockOnGoogleSignIn} />
    );

    const button = screen.getByText('Sign in with Google');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });

  it('should handle successful Google authentication', async () => {
    mockSignInWithGoogle.mockResolvedValue({
      success: true,
      accessToken: 'test-access-token',
    });

    renderWithChakra(
      <GoogleSignInButton onGoogleSignIn={mockOnGoogleSignIn} />
    );

    const button = screen.getByText('Sign in with Google');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnGoogleSignIn).toHaveBeenCalledWith('test-access-token');
    });
  });

  it('should handle authentication errors gracefully', async () => {
    mockSignInWithGoogle.mockResolvedValue({
      success: false,
      error: 'Authentication failed',
    });

    renderWithChakra(
      <GoogleSignInButton onGoogleSignIn={mockOnGoogleSignIn} />
    );

    const button = screen.getByText('Sign in with Google');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
      expect(mockOnGoogleSignIn).not.toHaveBeenCalled();
    });
  });

  it('should handle service exceptions', async () => {
    mockSignInWithGoogle.mockRejectedValue(
      new Error('Service unavailable')
    );

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithChakra(
      <GoogleSignInButton onGoogleSignIn={mockOnGoogleSignIn} />
    );

    const button = screen.getByText('Sign in with Google');
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Google sign-in error:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('should prevent multiple simultaneous authentication attempts', async () => {
    mockSignInWithGoogle.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, accessToken: 'token' }), 1000))
    );

    renderWithChakra(
      <GoogleSignInButton onGoogleSignIn={mockOnGoogleSignIn} />
    );

    const button = screen.getByText('Sign in with Google');
    
    // Click multiple times rapidly
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    // Should only call the service once
    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
  });
});