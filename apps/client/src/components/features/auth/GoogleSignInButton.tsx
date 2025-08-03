import React, { useState } from 'react';
import { Button, useColorModeValue, HStack, Text, useToast } from '@chakra-ui/react';
import GoogleAuthService from '../../../services/googleAuthService';

interface GoogleSignInButtonProps {
  onGoogleSignIn: (accessToken: string) => Promise<void>;
  isLoading?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  onGoogleSignIn, 
  isLoading = false 
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const toast = useToast();

  // Design system colors from branding guide
  const primaryColor = '#2563EB';
  const bgColor = useColorModeValue('white', '#1E293B');
  const borderColor = useColorModeValue('#E2E8F0', '#475569');
  const textColor = useColorModeValue('#475569', '#E2E8F0');

  const handlePress = async () => {
    if (isAuthenticating || isLoading) return;

    setIsAuthenticating(true);
    
    try {
      const result = await GoogleAuthService.signInWithGoogle();
      
      if (result.success && result.accessToken) {
        await onGoogleSignIn(result.accessToken);
      } else {
        toast({
          title: 'Authentication Failed',
          description: result.error || 'Google sign-in was cancelled or failed',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        title: 'Sign In Error',
        description: 'Failed to sign in with Google. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Google branding guidelines require specific styling for Google sign-in buttons
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  return (
    <Button
      onClick={handlePress}
      isLoading={isLoading || isAuthenticating}
      loadingText="Signing in with Google..."
      bg={bgColor}
      color={textColor}
      border="1px solid"
      borderColor={borderColor}
      size="lg"
      w="100%"
      _hover={{ 
        bg: useColorModeValue('#F8FAFC', '#2D3748'),
        borderColor: primaryColor,
      }}
      _active={{ 
        bg: useColorModeValue('#F1F5F9', '#1A202C'),
        borderColor: primaryColor,
      }}
      _disabled={{ 
        bg: 'gray.100', 
        borderColor: 'gray.300',
        cursor: 'not-allowed' 
      }}
      fontFamily="Inter"
      fontWeight="600"
      height="48px"
      borderRadius="6px"
    >
      <HStack spacing={3}>
        <GoogleIcon />
        <Text fontSize="16px" lineHeight="1.5">
          Sign in with Google
        </Text>
      </HStack>
    </Button>
  );
};

export default GoogleSignInButton;